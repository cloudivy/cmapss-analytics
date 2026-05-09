export async function loadTrainData() {
  const res = await fetch("/data/train_FD001.json")
  if (!res.ok) throw new Error("Could not load train_FD001.json — make sure it is in the /data folder")
  return await res.json()
}

export async function loadTestData() {
  const res = await fetch("/data/test_FD001.json")
  if (!res.ok) throw new Error("Could not load test_FD001.json — make sure it is in the /data folder")
  return await res.json()
}
