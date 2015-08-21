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
	
		var $newHtml = $(newHtml);
		if($newHtml.find(".screen").length === 0){
			$newHtml = $(tf.wrapInParent('screen', newHtml)); // we need there to be a parent so that we can remove it whenever.
		}
		

		// http://www.kevinleary.net/jquery-fadein-fadeout-problems-in-internet-explorer/
		$currentSelector.fadeOut().remove();
		$newHtml.appendTo($('.page-container')).hide().fadeIn();
	// }

	return $newHtml;
};