
import checkInscriptionForm from './../inscription/check_inscription_form';
import Flash from '../lib/flash';

const ERROR_CLASS = 'has-error';

export default class InscriptionForm {
  constructor(form) {
    this.$form = $(form);
    if (!this.$form.length) return;

    this.$inputs = 'name firstname birthday displayImage email nameTeam'.split(' ').reduce((h, inputName) => {
      h[inputName] = this.$form.find(`[name="${inputName}"]`);
      return h;
    }, {});

    this.$form.find('.message-sent, .message-error').delay(5000).fadeOut(400);
    this.$form.on('submit', (e) => this.onSubmit(e));
  }

  get inputValues() {
    var values = {};
    for (var inputName in this.$inputs) {
      values[inputName] = this.$inputs[inputName].val();
    }
    return values;
  }

  resetErrors() {
    this.$form
      .find('.form-group').removeClass(ERROR_CLASS).end()
      .find('.help-block').remove();
  }

  onSubmit(e) {
    // Stop submit event
    e.preventDefault();

    // Remove errors from previous submit call
    this.resetErrors();

    // Check if user filled the form correctly
    var errors = checkInscriptionForm(this.inputValues);

    // Error found
    if (Object.keys(errors).length) {
      // Display errors
      for (var inputName in errors) {
        this.displayInputError(inputName, errors[inputName]);
      }
      // Give focus to the first input with an error
      return this.$form.find('.has-error:first').find('input,select,textarea').focus();
    }

    // Display spinner
    var $button = this.$form.find('[type="submit"]').prop('disabled', true);

    // Param for upload file with Jquery and Ajax
    var formdata = (window.FormData) ? new FormData(this.$form[0]) : null;
    var data = (formdata !== null) ? formdata : this.$form.serialize();
    
    // Ajax call
    $.ajax({
      url:      this.$form.attr('action'),
      method:   this.$form.attr('method'),
      data:     data,
      contentType: false, // Mandatory for upload
      processData: false, // Mandatory for upload
      dataType: 'JSON',
      success: (data) => {
        if (data.error) {
          Flash.danger(data.error, this.$form);
        }
        if (data.message) {
          Flash.success(data.message, this.$form);
          this.$form[0].reset();
          grecaptcha.reset();
        }
      },
      complete: () => {
        $button.prop('disabled', false);
      }
    });
  }

  displayInputError(inputName, error) {
    this.$inputs[inputName]
      .closest('.form-group').addClass(ERROR_CLASS).end()       // Add class on form-group element
      .after($('<span>', { class: 'help-block' }).text(error)); // Add an help-block element with the error desc
  }
}