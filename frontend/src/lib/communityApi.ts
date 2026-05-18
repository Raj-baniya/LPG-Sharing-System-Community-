import { API_ROOT } from "@/lib/apiBase";
import { getToken } from "@/lib/trustAuth";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const parse = async (response: Response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed with status ${response.status}`);
  }
  return data;
};

export const communityApi = {
  listPosts: async () => parse(await fetch(`${API_ROOT}/community/posts`)),
  getPost: async (id: string) => parse(await fetch(`${API_ROOT}/community/posts/${id}`)),
  createPost: async (payload: unknown) =>
    parse(
      await fetch(`${API_ROOT}/community/posts`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
    ),
  deletePost: async (id: string) =>
    parse(
      await fetch(`${API_ROOT}/community/posts/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      })
    ),
  addComment: async (postId: string, payload: { content: string; parentCommentId?: string | null }) =>
    parse(
      await fetch(`${API_ROOT}/community/posts/${postId}/comments`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
    ),
  likePost: async (id: string) =>
    parse(
      await fetch(`${API_ROOT}/community/posts/${id}/like`, {
        method: "POST",
        headers: authHeaders(),
      })
    ),
  buyPost: async (id: string) =>
    parse(
      await fetch(`${API_ROOT}/community/posts/${id}/buy`, {
        method: "POST",
        headers: authHeaders(),
      })
    ),
};
