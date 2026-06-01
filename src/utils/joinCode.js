// Generates a join code like HAWKS42 from a team name
export function generateJoinCode(teamName) {
  const word = teamName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 6)

  const number = Math.floor(10 + Math.random() * 90) // 10-99
  return `${word}${number}`
}