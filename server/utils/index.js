export * from './face-recognitor'
export * from './image-utils'

export const resolveLadderFromMatches = matches => {
  let ladder = []
  matches.forEach(match => {
  	if (ladder.includes(match.loser)) {
  		const loserIndex = ladder.indexOf(match.loser)
  		let winnerIndex = ladder.indexOf(match.winner)
  		if (winnerIndex === -1) {
  			winnerIndex = Infinity
      }
  		if (winnerIndex > loserIndex) {
  			ladder.splice(loserIndex, 0, match.winner)
  		}
  		const uniquePlayers = []
  		ladder = ladder.filter(x => {
  			if (uniquePlayers.includes(x)) return false
  			uniquePlayers.push(x)
  			return true
  		})
  	} else {
  		if (!ladder.includes(match.winner)) {
  			ladder.push(match.winner)
  		}
  		ladder.push(match.loser)
  	}
  })
  return ladder
}
