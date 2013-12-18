(function (crafity) {

	(function (controles) {

		function ConstateringenView(repository) {
			var self = this;
			var constateringenRepo = repository.constateringen;

			var mygrid = new Grid(constateringenRepo.getColumnDefinitionList()).addClass("projects");
			constateringenRepo.getDataRows(function (err, result) {
				mygrid.addRows(result);
			});
		

			this.append(mygrid);
		}

		ConstateringenView.prototype = new Element("div");
		controles.ConstateringenView = ConstateringenView;

	}(crafity.controles = crafity.controles || {}));

}(window.crafity = window.crafity || {}));