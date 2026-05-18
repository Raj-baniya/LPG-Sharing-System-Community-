const { getSupabaseAdmin } = require('../config/supabaseClient');
const { findUserById } = require('../models/tempUserStore');

const memoryInitiatives = [
  {
    id: 'init_mem_1',
    name: 'Reliance Foundation LPG Support',
    initiative_type: 'trust',
    sponsor_name: 'Reliance Foundation',
    description: 'Subsidized LPG refill support for low-income households through verified providers.',
    eligibility: 'Households with income certificate and verified profile.',
    status: 'active',
  },
  {
    id: 'init_mem_2',
    name: 'PM Ujjwala Plus Local Connect',
    initiative_type: 'government',
    sponsor_name: 'Government Initiative',
    description: 'Government-backed LPG support drive for underserved areas with controlled pricing.',
    eligibility: 'Eligible household categories under local authority guidelines.',
    status: 'active',
  },
  {
    id: 'init_mem_3',
    name: 'Community Flame NGO Drive',
    initiative_type: 'ngo',
    sponsor_name: 'Community Flame NGO',
    description: 'NGO-led community cylinder support for emergency and monthly refill needs.',
    eligibility: 'Priority for senior citizens and emergency households.',
    status: 'active',
  },
];

const memoryOffers = [];

const normalizeOffer = (offer) => ({
  id: offer.id,
  title: offer.title,
  description: offer.description || '',
  location: offer.location || '',
  quantity_kg: Number(offer.quantity_kg || 0),
  unit_price: Number(offer.unit_price || 0),
  subsidy_percent: Number(offer.subsidy_percent || 0),
  available_units: Number(offer.available_units || 0),
  status: offer.status || 'active',
  created_at: offer.created_at,
  initiative: Array.isArray(offer.initiative) ? offer.initiative[0] : offer.initiative,
  provider: Array.isArray(offer.provider) ? offer.provider[0] : offer.provider,
});

const listInitiatives = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const typeFilter = String(req.query.type || '').trim().toLowerCase();

    if (!supabase) {
      let initiatives = [...memoryInitiatives].filter((item) => item.status === 'active');
      if (typeFilter) {
        initiatives = initiatives.filter((item) => String(item.initiative_type).toLowerCase() === typeFilter);
      }
      return res.status(200).json({ success: true, count: initiatives.length, initiatives, mode: 'memory' });
    }

    let query = supabase.from('ngo_initiatives').select('*').eq('status', 'active').order('name', { ascending: true });
    if (typeFilter) {
      query = query.eq('initiative_type', typeFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, count: (data || []).length, initiatives: data || [] });
  } catch (error) {
    return next(error);
  }
};

const listOffers = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const typeFilter = String(req.query.type || '').trim().toLowerCase();
    const initiativeId = String(req.query.initiativeId || '').trim();
    const statusFilter = String(req.query.status || 'active').trim().toLowerCase();

    if (!supabase) {
      let offers = memoryOffers.length
        ? [...memoryOffers]
        : [
            {
              id: 'offer_mem_1',
              title: 'Trust Assisted Family Refill',
              description: 'Verified refill support with trust-backed subsidy.',
              location: 'Andheri East',
              quantity_kg: 14.2,
              unit_price: 880,
              subsidy_percent: 10,
              available_units: 12,
              status: 'active',
              created_at: new Date().toISOString(),
              initiative: memoryInitiatives[0],
              provider: null,
            },
            {
              id: 'offer_mem_2',
              title: 'Government Scheme LPG Refill',
              description: 'Govt initiative pricing slab for eligible consumers.',
              location: 'Powai',
              quantity_kg: 14.2,
              unit_price: 760,
              subsidy_percent: 18,
              available_units: 8,
              status: 'active',
              created_at: new Date().toISOString(),
              initiative: memoryInitiatives[1],
              provider: null,
            },
          ];

      if (initiativeId) {
        offers = offers.filter((item) => item.initiative?.id === initiativeId);
      }
      if (typeFilter) {
        offers = offers.filter((item) => String(item.initiative?.initiative_type || '').toLowerCase() === typeFilter);
      }
      if (statusFilter) {
        offers = offers.filter((item) => String(item.status || '').toLowerCase() === statusFilter);
      }

      return res.status(200).json({ success: true, count: offers.length, offers, mode: 'memory' });
    }

    let initiativeIds = null;
    if (typeFilter) {
      const { data: initiatives, error: iErr } = await supabase
        .from('ngo_initiatives')
        .select('id')
        .eq('initiative_type', typeFilter)
        .eq('status', 'active');

      if (iErr) throw iErr;
      initiativeIds = (initiatives || []).map((item) => item.id);
      if (!initiativeIds.length) {
        return res.status(200).json({ success: true, count: 0, offers: [] });
      }
    }

    let query = supabase
      .from('ngo_lpg_offers')
      .select('id,title,description,location,quantity_kg,unit_price,subsidy_percent,available_units,status,created_at,initiative:initiative_id(id,name,initiative_type,sponsor_name),provider:provider_user_id(id,name,role,is_verified)')
      .order('created_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    if (initiativeId) {
      query = query.eq('initiative_id', initiativeId);
    }
    if (initiativeIds) {
      query = query.in('initiative_id', initiativeIds);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, count: (data || []).length, offers: (data || []).map(normalizeOffer) });
  } catch (error) {
    return next(error);
  }
};

const createOffer = async (req, res, next) => {
  try {
    const supabase = getSupabaseAdmin();
    const providerId = req.user.id;
    const {
      initiativeId,
      title,
      description,
      location,
      quantityKg,
      unitPrice,
      subsidyPercent,
      availableUnits,
    } = req.body || {};

    if (!initiativeId || !title) {
      res.status(400);
      throw new Error('initiativeId and title are required');
    }

    const payload = {
      initiative_id: initiativeId,
      provider_user_id: providerId,
      title: String(title).trim(),
      description: String(description || '').trim(),
      location: String(location || '').trim(),
      quantity_kg: Number(quantityKg || 14.2),
      unit_price: Number(unitPrice || 980),
      subsidy_percent: Number(subsidyPercent || 0),
      available_units: Number(availableUnits || 1),
      status: 'active',
    };

    if (!supabase) {
      const initiative = memoryInitiatives.find((item) => item.id === initiativeId);
      if (!initiative) {
        res.status(404);
        throw new Error('Initiative not found');
      }

      const owner = findUserById(providerId);
      const offer = {
        id: `offer_mem_${Date.now()}`,
        ...payload,
        initiative,
        provider: owner
          ? { id: owner.id, name: owner.name, role: owner.role, is_verified: !!owner.isVerified }
          : { id: providerId, name: 'Provider', role: 'provider', is_verified: false },
        created_at: new Date().toISOString(),
      };
      memoryOffers.unshift(offer);
      return res.status(201).json({ success: true, message: 'Initiative LPG offer created', offer, mode: 'memory' });
    }

    const { data, error } = await supabase
      .from('ngo_lpg_offers')
      .insert([payload])
      .select('id,title,description,location,quantity_kg,unit_price,subsidy_percent,available_units,status,created_at,initiative:initiative_id(id,name,initiative_type,sponsor_name),provider:provider_user_id(id,name,role,is_verified)')
      .single();

    if (error) {
      res.status(400);
      throw new Error(error.message);
    }

    return res.status(201).json({ success: true, message: 'Initiative LPG offer created', offer: normalizeOffer(data) });
  } catch (error) {
    return next(error);
  }
};

const listMyOffers = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      const offers = memoryOffers.filter((item) => item.provider?.id === providerId || item.provider_user_id === providerId);
      return res.status(200).json({ success: true, count: offers.length, offers, mode: 'memory' });
    }

    const { data, error } = await supabase
      .from('ngo_lpg_offers')
      .select('id,title,description,location,quantity_kg,unit_price,subsidy_percent,available_units,status,created_at,initiative:initiative_id(id,name,initiative_type,sponsor_name),provider:provider_user_id(id,name,role,is_verified)')
      .eq('provider_user_id', providerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, count: (data || []).length, offers: (data || []).map(normalizeOffer) });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listInitiatives,
  listOffers,
  createOffer,
  listMyOffers,
};
