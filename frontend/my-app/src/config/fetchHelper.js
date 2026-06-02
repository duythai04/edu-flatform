export const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text || null;
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("safeFetch error:", url, err);
    return { ok: false, status: 0, data: null };
  }
};
