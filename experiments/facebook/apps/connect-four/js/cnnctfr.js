// CNNCTFR - Central Neural Network Computer That Forms Rows

var cnnctfr = function() {};

$(window).load(function() {

var abc = ['a', 'b', 'c', 'd', 'e', 'f'];
var winning = [];
var myTurn = null;
var wins = [0, 0, 0];
var badMoves = [];
var distantlyBadMoves = [];

// Start new game
cnnctfr.newGame = function() {
	if (!winning.length) {
		winning = winningCombinations();
	}
	badMoves = [];
	distantlyBadMoves = [];
	clearSlot('all');
	var firstPlayer = Math.floor(Math.random()*2);
	// var firstPlayer = 1;
	if (firstPlayer === 1) {
		myTurn = 1;
	}
	else {
		myTurn = 0;
		$('.slot').css('cursor', 'auto');
		var analysis = {
			'computer': analyzeBoard('computer'),
			'human': analyzeBoard('human')
		};
		window.setTimeout(function() {
			computerPlay(analysis);
		}, 700);
	}
	window.setTimeout(function() {
		talk.say('start');
	}, 300);
}

// Calculate array of winning combinations
function winningCombinations() {
	var w = 0;
	var result = [];
	for (var i in abc) {
		for (var r = 1; r < 5; r++) {
			result[w] = [];
			for (var d = 0; d < 4; d++) {
				result[w].push(abc[i] + (r + d));
			}
			w++;
		}
	}
	for (var i = 7; i > 0; i--) {
		for (var r = 6; r !== 3; r--) {
			result[w] = [];
			for (var d = 4; d > 0; d--) {
				result[w].push(abc[r - d] + i);
			}
			w++;
		}
	}
	for (var i = 3; i < abc.length; i++) {
		for (var r = 4; r < 8; r++) {
			result[w] = [];
			for (var d = 0; d < 4; d++) {
				result[w].push(abc[i - d] + (r - d));
			}
			w++;
		}
	}
	for (var i = 3; i < abc.length; i++) {
		for (var r = 4; r > 0; r--) {
			result[w] = [];
			for (var d = 0; d < 4; d++) {
				result[w].push(abc[i - d] + (r + d));
			}
			w++;
		}
	}
	return result;
}

// Randomly shuffle array
function shuffle(array) {
	var tmp, current, top = array.length;
	if(top) while(--top) {
		current = Math.floor(Math.random() * (top + 1));
		tmp = array[current];
		array[current] = array[top];
		array[top] = tmp;
	}
	return array;
}

// Return empty slots in a column
function emptySlots(column) {
	var empty = [];
	for (var i in abc) {
		if ($('#' + abc[i] + column).attr('status') === 'empty') {
			empty.push(abc[i] + column);
		}
	}
	if (empty.length === 0) {
		return false;
	}
	return empty;
}

// Return columns with free slots
function freeColumns() {
	var free = [];
	for (var i = 1; i < 8; i++) {
		if (emptySlots(i)) {
			free.push(i.toString());
		}
	}
	return free;
}

// Insert disc into slot.
// 0 if computer, 1 if human
function insertDisc(slot, human) {
	if (human) {
		var playerColor = '#879E2C'
		$('#' + slot).attr('status', 'human');
	}
	else {
		var playerColor = '#61B7D0';
		$('#' + slot).attr('status', 'computer');
	}
	$('#' + slot).stop();
	$('#' + slot).css('cursor', 'auto');
	$('#' + slot).css('background', playerColor);
	$('#' + slot).css('border-color', playerColor);
}

// Clear slot
// 'all' to clear all slots
function clearSlot(slot) {
	if (slot === 'all') {
		slot = '.slot';
	}
	else {
		slot = '#' + slot;
	}
	$(slot).attr('status', 'empty');
	$(slot).css('cursor', 'pointer');
	$(slot).css('background', '');
	$(slot).css('border-color', '#112734');
}

// See which slot a disc will end up at if dropped in column
function testDrop(column) {
	if (empty = emptySlots(column)) {
		return empty[empty.length - 1];
	}
	return false;
}

// Drop a disc with animation through column
// 0 if computer, 1 if human
function dropDisc(column, human, phrase) {
	var empty = emptySlots(column);
	var i = 0;
	var drop = window.setInterval(function() {
		if (i > 0) {
			clearSlot(empty[i - 1]);
		}
		insertDisc(empty[i], human);
		i++;
		if (i === empty.length) {
			window.clearInterval(drop);
			if (phrase) { talk.say(phrase) }
			nextMove(human);
		}
	}, 53);	
}

// Move the game along after a disc is dropped
// 0 for computer, 1 for human
function nextMove(human) {
	var analysis = {
		'computer': analyzeBoard('computer'),
		'human': analyzeBoard('human')
	};
	if (human) {
		if (analysis['human']['win'].length) {
			console.log('COMPUTER: LOSE');
			resetGame(human);
		}
		else {
			window.setTimeout(function() {
				showAnalysis(analysis);
			}, 100);
		}
	}
	else {
		if (analysis['computer']['win'].length) {
			console.log('COMPUTER: WIN');
			resetGame(human);
		}
		else {
			myTurn = 1;
			$('.slot').each(function(index) {
				if ($(this).attr('status') === 'empty') {
					$(this).css('cursor', 'pointer');
				}
			});
		}
	}
}

// Reset game, increase scoreboard
// 0 is computer winner, 1 if human winner
// 2 if draw
function resetGame(winner) {
	window.setTimeout(function() {
		$('#board').fadeOut(function() {
			$('.computer').text(wins[0]);
			$('.human').text(wins[1]);
			$('#wins').fadeIn(function() {
				if (winner === 1) {
					talk.say('losing');
				}
				else if (winner === 2) {
					talk.say('draw');
				}
				else if (!wins[1] && Math.floor(Math.random()*2)) {
					talk.say('undefeated');
				}
				else {
					talk.say('winning');
				}
				window.setTimeout(function() {
					wins[winner]++;
					$('.computer').text(wins[0]);
					$('.human').text(wins[1]);
				}, 600);
				window.setTimeout(function() {
					$('#wins').fadeOut(function() {
						cnnctfr.newGame();
						$('#board').fadeIn();
					});
				}, 3400);
			});
		});
	}, 2500);
}

// If slot is clicked
$('.slot').click(function() {
	var row = $(this).attr('id')[0];
	var column = $(this).attr('id')[1];
	if (myTurn && ($(this).attr('status') === 'empty')) {
		myTurn = 0;
		$('.slot').css('cursor', 'auto');
		console.log('HUMAN: PLAYING MOVE AT ' + testDrop(column).toUpperCase());
		dropDisc(column, 1);
	}
});

// Analyze board looking for winning combinations
// Criteria must be 'human' or 'computer'
// By default, just handles wins and draws
// Also returns an object containing:
// win: Winning combination, if any
// nearWins: With 1 disc missing if any
// possibleWins: With 2 discs missing, if any
// distantWins: With 3 discs missing, if any
// disadvantage: Array of disadvantageous moves
// Missing disc location(s) arranged from more to less critical
function analyzeBoard(criteria) {
	var win = [];
	var nearWins = [];
	var possibleWins = [];
	var distantWins = [];
	var disadvantage = [];
	var distantDisadvantage = [];
	shuffle(winning);
	for (var i in winning) {
		var m = 0;
		var near = [];
		for (var r in winning[i]) {
			if ($('#' + winning[i][r]).attr('status') === criteria) {
				m++;
				if ($('#' + winning[i][r - 1]).attr('status') === 'empty') {
					if (near.indexOf(winning[i][r - 1]) >= 0) {
						near.splice(near.indexOf(winning[i][r - 1]), 1);
					}
					near.unshift(winning[i][r - 1]);
				}
				if ($('#' + winning[i][r + 1]).attr('status') === 'empty') {
					if (near.indexOf(winning[i][r + 1]) >= 0) {
						near.splice(near.indexOf(winning[i][r + 1]), 1);
					}
					near.unshift(winning[i][r + 1]);
				}
			}
			else if ($('#' + winning[i][r]).attr('status') === 'empty') {
				if (near.indexOf(winning[i][r]) < 0) {
					near.push(winning[i][r]);
				}
				else {
					near.splice(near.indexOf(winning[i][r]), 1);
					near.unshift(winning[i][r]);
				}
			}
		}
		if (m === 4) {
			for (var r in winning[i]) {
				$('#' + winning[i][r]).css('border-color', '#FFF');
				win.push(winning[i][r]);
			}
			$('.slot').css('cursor', 'auto');
		}
		else if ((m === 3) && (near.length === 1)) {
			var p = abc[abc.indexOf(near[0][0]) + 1] + near[0][1];
			if (($('#' + p).attr('status') === 'empty') && (disadvantage.indexOf(p) < 0)) {
				disadvantage.push(p);
			}
			if (nearWins.indexOf(near[0]) < 0) {
				nearWins.push(near[0]);
			}
		}
		else if ((m === 2) && (near.length === 2)) {
			for (var d in near) {
				var p = abc[abc.indexOf(near[d][0]) + 1] + near[d][1];
				if (($('#' + p).attr('status') === 'empty') && (distantDisadvantage.indexOf(p) < 0)) {
					distantDisadvantage.push(p);
				}
			}
			if (possibleWins.indexOf(near) < 0) {
				possibleWins.push(near);
			}
		}
		else if ((m === 1) && (near.length === 3)) {
			if (distantWins.indexOf(near) < 0) {
				distantWins.push(near);
			}
		}
	}
	// Detect draw
	var draw = 1;
	$('.slot').each(function(index) {
		if ($(this).attr('status') === 'empty') {
			draw = 0;
		}
	});
	if (draw) {
		resetGame(2);
	}
	return {
		'win': win, 
		'nearWins': nearWins, 
		'possibleWins': possibleWins, 
		'distantWins': distantWins,
		'disadvantage': disadvantage,
		'distantDisadvantage': distantDisadvantage
	};
}

// Visualizes AI thinking process
// Before actually making move
function showAnalysis(analysis) {
	var slots = [];
	for (var i in analysis) {
		for (var r in analysis[i]) {
			for (var d in analysis[i][r]) {
				for (var s in analysis[i][r][d]) {
					slots.push(analysis[i][r][d][s]);
				}
			}
		}
	}
	var i = 0;
	var show = window.setInterval(function() {
		if (i > 0) {
			$('#' + slots[i - 1]).animate({'border-color': '#879E2C'}, 190);
		}
		if (i === slots.length) {
			window.clearInterval(show);
			window.setTimeout(function() {
				computerPlay(analysis);
			}, 20);
		}
		i++;
		$('#' + slots[i]).css('border-color', 'rgba(64, 145, 244, 1)');
	}, 20);
}

// Computer AI
// Needs analysis object as input in order to work:
// analysis = {
// 	'computer': analyzeBoard('computer'),
// 	'human': analyzeBoard('human')
// };
var computerPlay = function(analysis) {
	computerPlay.detectThreats(analysis);
	if (computerPlay.win(analysis)) { return true }
	if (computerPlay.block(analysis)) { return true }
	if (computerPlay.offensive(analysis)) { return true }
	if (computerPlay.defensive(analysis)) { return true }
	if (computerPlay.distantOffensive(analysis)) { return true }
	if (computerPlay.distantDefensive(analysis)) { return true }
	if (computerPlay.random()) { return true }
	else { return false }
}

computerPlay.detectThreats = function(analysis) {
	if (analysis['human']['disadvantage'].length) {
		for (var i in analysis['human']['disadvantage']) {
			if (badMoves.indexOf(analysis['human']['disadvantage'][i]) < 0) {
				console.log('COMPUTER: DISASTROUS MOVE DETECTED AT '
				+ analysis['human']['disadvantage'][i].toUpperCase());
				badMoves.push(analysis['human']['disadvantage'][i]);
			}
		}
	}
	if (analysis['computer']['disadvantage'].length) {
		for (var i in analysis['computer']['disadvantage']) {
			if (badMoves.indexOf(analysis['computer']['disadvantage'][i]) < 0) {
				console.log('COMPUTER: DISADVANTAGEOUS MOVE DETECTED AT '
				+ analysis['computer']['disadvantage'][i].toUpperCase());
				badMoves.push(analysis['computer']['disadvantage'][i]);
			}
		}
	}
	if (analysis['human']['distantDisadvantage'].length) {
		console.log('COMPUTER: DISTANTLY DISADVANTAGEOUS MOVE DETECTED AT '
		+ analysis['human']['distantDisadvantage'].join(', ').toUpperCase());
		distantlyBadMoves = analysis['human']['distantDisadvantage'].slice();
	}
}

computerPlay.win = function(analysis) {
	if (nearWin = analysis['computer']['nearWins']) {
		for (var i in nearWin) {
			if (testDrop(nearWin[i][1]) === nearWin[i]) {
				console.log('COMPUTER: PLAYING WINNING MOVE AT '
				+ nearWin[i].toUpperCase());
				dropDisc(nearWin[i][1], 0);
				return true;
			}
		}
	}
	return false;
}

computerPlay.block = function(analysis) {
	if (nearWin = analysis['human']['nearWins']) {
		for (var i in nearWin) {
			if (testDrop(nearWin[i][1]) === nearWin[i]) {
				console.log('COMPUTER: PLAYING BLOCKING MOVE AT '
				+ nearWin[i].toUpperCase());
				dropDisc(nearWin[i][1], 0, 'blocking');
				return true;
			}
		}
	}
	return false;
}

computerPlay.offensive = function(analysis) {
	if (possibleWin = analysis['computer']['possibleWins']) {
		for (var i in possibleWin) {
			for (var r in possibleWin[i]) {
				if ((testDrop(possibleWin[i][r][1]) === possibleWin[i][r])
				&& (badMoves.indexOf(possibleWin[i][r]) < 0)) {
					console.log('COMPUTER: PLAYING OFFENSIVE MOVE AT '
					+ possibleWin[i][r].toUpperCase());
					dropDisc(possibleWin[i][r][1], 0);
					return true;
				}
			}
		}
	}
	return false;
}

computerPlay.defensive = function(analysis) {
	if (possibleWin = analysis['human']['possibleWins']) {
		for (var i in possibleWin) {
			for (var r in possibleWin[i]) {
				if ((testDrop(possibleWin[i][r][1]) === possibleWin[i][r])
				&& (badMoves.indexOf(possibleWin[i][r]) < 0)) {
					console.log('COMPUTER: PLAYING DEFENSIVE MOVE AT '
					+ possibleWin[i][r].toUpperCase());
					dropDisc(possibleWin[i][r][1], 0);
					return true;
				}
			}
		}
	}
	return false;
}

computerPlay.distantOffensive = function(analysis) {
	if (distantWin = analysis['computer']['distantWins']) {
		for (var i in distantWin) {
			for (var r in distantWin[i]) {
				if ((testDrop(distantWin[i][r][1]) === distantWin[i][r])
				&& (badMoves.indexOf(distantWin[i][r]) < 0)
				&& (distantlyBadMoves.indexOf(distantWin[i][r]) < 0)) {
					console.log('COMPUTER: PLAYING DISTANTLY RELEVANT MOVE AT '
					+ distantWin[i][r].toUpperCase());
					dropDisc(distantWin[i][r][1], 0);
					return true;
				}
			}
		}
	}
	return false;
}

computerPlay.distantDefensive = function(analysis) {
	if (distantWin = analysis['human']['distantWins']) {
		for (var i in distantWin) {
			for (var r in distantWin[i]) {
				if ((testDrop(distantWin[i][r][1]) === distantWin[i][r])
				&& (badMoves.indexOf(distantWin[i][r]) < 0)
				&& (distantlyBadMoves.indexOf(distantWin[i][r]) < 0)) {
					console.log('COMPUTER: BLOCKING DISTANTLY RELEVANT THREAT AT '
					+ distantWin[i][r].toUpperCase());
					dropDisc(distantWin[i][r][1], 0);
					return true;
				}
			}
		}
	}
	return false;
}

computerPlay.random = function() {
	var free = freeColumns();
	for (var i in badMoves) {
		if ((free.indexOf(badMoves[i][1]) >= 0) && (free.length > 1)) {
			free.splice(free.indexOf(badMoves[i][1]), 1);
		}
	}
	for (var i in distantlyBadMoves) {
		if ((free.indexOf(distantlyBadMoves[i][1]) >= 0) && (free.length > 1)) {
			free.splice(free.indexOf(distantlyBadMoves[i][1]), 1);
		}
	}
	if ((free.indexOf('1') >= 0) && (free.length > 1)) {
		free.splice(free.indexOf('1'), 1);
	}
	if ((free.indexOf('7') >= 0) && (free.length > 1)) {
		free.splice(free.indexOf('7'), 1);
	}
	r = free[Math.floor(Math.random()*free.length)];
	console.log('COMPUTER: PLAYING RANDOM MOVE AT '
	+ testDrop(r).toUpperCase());
	dropDisc(r, 0);
	return true;
}


cnnctfr.newGame();

});
