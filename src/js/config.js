/*
MIT License
Copyright (c) 2018 Cybozu
https://github.com/kintone/SAMPLE-Conditional-record-count-plug-in/blob/master/LICENSE
*/
jQuery.noConflict();
(function($, PLUGIN_ID) {
  'use strict';

  // Get configuration settings
  var CONF = kintone.plugin.app.getConfig(PLUGIN_ID);
  var DROPDOWN_VALUES = {};

  var $form = $('.js-submit-settings');
  var $cancelButton = $('.js-cancel-button');
  var $selectDropdown = $('select[name="js-select_dropdown_field"]');
  var $selectDropdownValue = $('select[name="js-select_dropdown_value"]');

  function escapeHtml(htmlstr) {
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function setDropDown() {
    // Retrieve field information, then set drop-down
    return kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true), 'GET',
      {'app': kintone.app.getId()}).then(function(resp) {

      Object.keys(resp.properties).forEach(function(key) {
        var prop = resp.properties[key];
        var $option = $('<option>');

        if (prop.type === 'DROP_DOWN') {
          $option.attr('value', prop.code);
          $option.text(escapeHtml(prop.label));
          $selectDropdown.append($option.clone());
          DROPDOWN_VALUES[prop.code] = prop.options;
        }
      });

      // Set default values
      $selectDropdown.val(CONF.dropdown_field);

    }, function(resp) {
      return alert('Failed to retrieve field(s) information');
    });
  }
  function setDropdownValue() { // Set drop-down values based on drop-down selected.
    var dropdown_field = $selectDropdown.val();
    var opt;
    if (!dropdown_field) {
      return; // Return if the first drop-down is not yet selected.
    }
    $selectDropdownValue.empty();
    opt = DROPDOWN_VALUES[dropdown_field];
    Object.keys(opt).forEach(function(key) {
      var prop = opt[key];
      var $option = $('<option>');

      $option.attr('value', prop.label);
      $option.text(escapeHtml(prop.label));
      $selectDropdownValue.append($option.clone());
    });

    // Set default values
    $selectDropdownValue.val(CONF.dropdown_choice);
    if ($selectDropdownValue.val() === null) { // Set first option if no value is selected.
      $('select[name="js-select_dropdown_value"] option:first').attr('selected', 'selected');
    }
  }
  $(document).ready(function() {
    // Set drop-down list
    setDropDown()
      .then(setDropdownValue);
    // Set input values when 'Save' button is clicked
    $form.on('submit', function(e) {
      var config = {};
      var dropdown_field = $selectDropdown.val();
      var dropdown_choice = $selectDropdownValue.val();
      e.preventDefault();

      config.dropdown_field = dropdown_field;
      config.dropdown_choice = dropdown_choice;

      kintone.plugin.app.setConfig(config, function() {
        alert('The plug-in settings have been saved. Please update the app!');
        window.location.href = '/k/admin/app/flow?app=' + kintone.app.getId();
      });
    });

    // Process when 'Cancel' is clicked
    $cancelButton.on('click', function() {
      window.location.href = '/k/admin/app/' + kintone.app.getId() + '/plugin/';
    });
    // Populate the second drop-down when the first drop-down is changed.
    $selectDropdown.change(function() {
      setDropdownValue();
    });
  });
})(jQuery, kintone.$PLUGIN_ID);
