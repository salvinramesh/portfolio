(function ($) {
    $(document).ready(function () {
        var categoryField = $('#id_category');
        var fileField = $('.field-file');
        var imageField = $('.field-image');
        var multipleImagesField = $('.field-multiple_images');
        var textContentField = $('.field-text_content');
        var imageInlines = $('.inline-group');

        function updateFieldVisibility() {
            var category = categoryField.val();

            // Hide all first
            fileField.hide();
            imageField.hide();
            multipleImagesField.hide();
            imageInlines.hide();

            if (category === 'Docs') {
                // For Docs: Show only file field
                fileField.show();
                textContentField.find('.help').text('Optional description or notes');
            } else if (category === 'IDs') {
                // For IDs: Show image and multiple images
                imageField.show();
                multipleImagesField.show();
                imageInlines.show();
                textContentField.find('.help').text('ID number or details');
            } else if (category === 'Photos') {
                // For Photos: Show image and multiple images
                imageField.show();
                multipleImagesField.show();
                imageInlines.show();
                textContentField.find('.help').text('Photo description or caption');
            } else if (category === 'Others') {
                // For Others: Show all fields
                fileField.show();
                imageField.show();
                multipleImagesField.show();
                imageInlines.show();
                textContentField.find('.help').text('Notes or additional information');
            }
        }

        // Initial visibility update
        updateFieldVisibility();

        // Update on category change
        categoryField.change(updateFieldVisibility);
    });
})(django.jQuery);
