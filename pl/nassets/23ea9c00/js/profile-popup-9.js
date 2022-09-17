$(function () {
	var modal = window.gcModalFactory.create({show: false});
	modal.get$Modal().find(modal.getContentSelector()).css('padding', '0 20px');
	$('.edit-profile-popup-btn').click(function (e) {
		ajaxCall('/user/my/profile', {}, {}, function (response) {
			modal.setContent(response.html);
			modal.show();

			modal.get$Modal().find('.profile-form').ajaxForm({
				success: function (response) {
					//modal.hide();
					window.location.reload();
				}
			});
		});
		return false;
	});
});