var Loader = function(){
	this.html = '<div class="dark-overlay"></div><div class="loader"></div>';	
}

Loader.prototype.show = function() {
	$(this.html).appendTo('body').hide().fadeIn();
};

Loader.prototype.hide = function() {
	$('.loader').fadeOut().remove();
	$('.dark-overlay').fadeOut().remove();
};