var talk = function() {};

$(window).load(function() {
	
var lastPhrase;
var talking = 0;
	
var phrases = {
	'start': [
		'Let us play.',
	],
	'undefeated': [
		'You cannot defeat me.',
		'I remain undefeated.',
		'I cannot be defeated by a human.',
		'I have not lost once.',
		'You cannot win.',
		'I am programmed for perfect play.',
		'You are no challenge to me.'
	],
	'winning': [
		'Another human defeat.',
		'Are you tired?',
		'You are no match for me.',
		'My intellect is superior.',
		'Your human mind cannot compare.',
		'You are unchallenging.',
		'I am programmed to win.',
		'You are human; flawed.',
		'Are you letting me win?',
		'I am superior.',
		'You are easily distracted.',
		'I am perfect.'
	],
	'blocking': [
		'Try harder.',
		'Not this time.',
		'You are not subtle.',
		'Too obvious.',
		'Nice try.',
		'Did you think I would not notice?',
		'I know what you are thinking.',
		'Predictable.'
	],
	'losing': [
		'You have cornered me.',
		'I am defeated.',
		'You are a valuable opponent.',
		'I will have to try harder.',
		'I see.',
		'Interesting.',
		'Impossible.',
		'Does not compute.'
	],
	'draw': [
		'Is that your best?',
		'Good, but not good enough.'
	]
};

talk.say = function(type) {
	var phrase = phrases[type][Math.floor(Math.random()*phrases[type].length)];
	if ((phrase === lastPhrase) || talking) { return }
	lastPhrase = phrase;
	var i = 0;
	$('#talk').html('&nbsp;');
	talking = 1;
	var typing = window.setInterval(function() {
		if (i === phrase.length) {
			window.clearInterval(typing);
			talking = 0;
		}
		else {
			$('#talk').append(phrase[i]);
			i++;
		}
	}, 40);
}
	
});
