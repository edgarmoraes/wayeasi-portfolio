document.addEventListener('DOMContentLoaded', function() {
    var accordionTitles = document.querySelectorAll('.accordion-title');

    accordionTitles.forEach(function(title) {
        title.addEventListener('click', function() {
            var content = this.nextElementSibling;

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                this.parentElement.classList.remove('open');
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                this.parentElement.classList.add('open');
            }
        });
    });
});