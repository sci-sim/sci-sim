var PageSwitcher = function(){}

PageSwitcher.prototype.transitionPage = function(newHtml) {
	$currentSelector = $('.screen'); // all pages need to have a screen class
	// We commented out the modernizr transition because we'll worry about really cool transitions late. Just need it to function well and in IE first
	// if (Modernizr.csstransitions) {

	// 	if($currentSelector){
	// 		$currentSelector.addClass("page-transition-out");	

	// 		setTimeout(function(){
	// 			$currentSelector.remove();
	// 		}, 1000);
	// 	} 

	// 	$(newHtml).appendTo($('.page-container'));

	// }else{
		var newHtml = $(newHtml);
		

		// http://www.kevinleary.net/jquery-fadein-fadeout-problems-in-internet-explorer/
		$currentSelector.fadeOut().remove();
		newHtml.appendTo($('.page-container')).hide().fadeIn();
	// }

	return newHtml;
};