import Flash from '../lib/flash';
import checkForm from './check_form';

export default class CheckBoxForm {
  constructor(form) {
    this.$form = $(form);
    this.$checkBox = this.$form.find('[type="checkbox"]');
    if (!this.$form.length) return;

    this.$checkBox.on('click', (e) => this.onClick(e));
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

  onClick(e) {
    var i = 0;
    $('input[type=checkbox]').each(function () {
      if (this.checked) {
        let idPlayers = $('#' + $(this).val()).find('[headers="idPlayers"]').text();
        let name = $('#' + $(this).val()).find('[headers="name"]').text();
        let firstname = $('#' + $(this).val()).find('[headers="firstname"]').text();
        let birthday = $('#' + $(this).val()).find('[headers="birthday"]').text();
        let idTeam = $('#' + $(this).val()).find('[headers="idTeam"]').text();
        let email = $('#' + $(this).val()).find('[headers="email"]').text();

        let html2 = `
        <td><input name='idPlayers' type='text' value='${idPlayers}' class='form-control input-md' readonly="readonly"></td>
      `;
        //$('#'+idPlayers).html(html);
        $('#' + $(this).val()).find('[headers="idPlayers"]').replaceWith(html2);

        html2 = `
        <td><input name='name' type='text' value='${name}' class='form-control input-md'></td>
      `;

        $('#' + $(this).val()).find('[headers="name"]').replaceWith(html2);

        html2 = `
        <td><input name='firstname' type='text' value='${firstname}' class='form-control input-md'></td>
      `;

        $('#' + $(this).val()).find('[headers="firstname"]').replaceWith(html2);

        html2 = `
        <td><input name='birthday' type='date' value='${birthday}' class='form-control input-md'></td>
      `;

        $('#' + $(this).val()).find('[headers="birthday"]').replaceWith(html2);

        html2 = `
        <td><input name='idTeam' type='text' value='${idTeam}' class='form-control input-md'></td>
      `;
        $('#' + $(this).val()).find('[headers="idTeam"]').replaceWith(html2);

        html2 = `
        <td><input name='email' type='text' value='${email}' class='form-control input-md'></td>
      `;
        $('#' + $(this).val()).find('[headers="email"]').replaceWith(html2);

        /* html2 = `
         <td><input name='displayImage' type='file' class='form-control input-md' accept="image/*"></td>
         `;
         $('#'+$(this).val()).find('[headers="displayImage"]').html(html2);
         */

        html2 = `
        <td>
          <button class='glyphicon glyphicon-ok' value=${idPlayers} type="submit">V</button>
          <button class="glyphicon glyphicon-remove" value=${idPlayers}>X</button>
        </td>
      `;
        $('#' + $(this).val()).find('[headers="button"]').replaceWith(html2);
      }
    });
  }

  resetForm(){
    $('form-group').each(function () {
      $(this).append()
    });
  }
  onSubmit(e) {

    // Stop submit event
    e.preventDefault();

    this.$inputs = 'idPlayers name firstname birthday displayImage email idTeam'.split(' ').reduce((h, inputName) => {
      h[inputName] = this.$form.find(`[name="${inputName}"]`);
      return h;
    }, {});

    // Check if user filled the form correctly
    var errors = checkForm(this.inputValues);
    // Error found

    // Display spinner
    var $button = this.$form.find('[type="submit"]').prop('disabled', true);

    // Param for upload file with Jquery and Ajax
    var formdata = (window.FormData) ? new FormData(this.$form[0]) : null;
    var data = (formdata !== null) ? formdata : this.$form.serialize();

    // Ajax call
    $.ajax({
      url:      this.$form.attr('action') + this.inputValues.idPlayers,
      method:   this.$form.attr('method'),
      data:     this.$form.serialize(),
      dataType: 'JSON',
      success: (data) => {
        if (data.errors) {
          alert(data.errors);

          for (var inputName in errors) {
            Flash.danger(inputName+ ' : ' + errors[inputName], this.$form);
            //this.displayInputError(inputName, errors[inputName]);
          }
        }
        if (data.message) {
          Flash.success(data.message, this.$form);
          //this.$form[0].reset();
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