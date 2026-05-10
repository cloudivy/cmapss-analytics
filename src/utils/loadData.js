const BASE = import.meta.env.BASE_URL

export async function loadTrainData() {
  const res = await fetch(`${BASE}data/train_FD001.json`)
  if (!res.ok) throw new Error("Could not load train_FD001.json — make sure it is in the public/data folder")
  return await res.json()
}

export async function loadTestData() {
  const res = await fetch(`${BASE}data/test_FD001.json`)
  if (!res.ok) throw new Error("Could not load test_FD001.json — make sure it is in the public/data folder")
  return await res.json()
}
