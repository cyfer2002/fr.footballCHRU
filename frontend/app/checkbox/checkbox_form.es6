import Flash from '../lib/flash';
import checkForm from './check_form';

export default class CheckBoxForm {
  constructor(form) {
    this.$form = $(form);
    this.$checkBox = this.$form.find('[type="checkbox"]');
    if (!this.$form.length) return;

    this.$form.on('click', (e) => this.onClick(e));
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
    $('input[type=checkbox]').each(function () {
      if (this.checked) {
        var idPlayers = $('#'+$(this).val()).find('[headers="idPlayers"]').text();
        var name = $('#'+$(this).val()).find('[headers="name"]').text();
        var firstname = $('#'+$(this).val()).find('[headers="firstname"]').text();
        var birthday = $('#'+$(this).val()).find('[headers="birthday"]').text();
        var idTeam = $('#'+$(this).val()).find('[headers="idTeam"]').text();
        var email = $('#'+$(this).val()).find('[headers="email"]').text();

        var html = `
          <td><input name='idPlayers' type='text' value='${idPlayers}' class='form-control input-md' readonly="readonly"></td>
          <td><input name='name' type='text' value='${name}' class='form-control input-md'></td>
          <td><input name='firstname' type='text' value='${firstname}' class='form-control input-md'></td>
          <td><input name='birthday' type='date' value='${birthday}' class='form-control input-md'></td>
          <td><input name='idTeam' type='text' value='${idTeam}' class='form-control input-md'></td>
          <td><input name='email' type='text' value='${email}' class='form-control input-md'></td>
          <td><input name='displayImage' type='file' class='form-control input-md' accept="image/*"></td>
          <td><button class='glyphicon glyphicon-ok' value=${idPlayers} type="submit" /><button class="glyphicon glyphicon-remove" value=${idPlayers} /></td>
        `;
        var html2 = `
          <td><input name='idPlayers' type='text' value='${idPlayers}' class='form-control input-md' readonly="readonly"></td>
        `;
        //$('#'+idPlayers).html(html);
        $('#'+$(this).val()).find('[headers="idPlayers"]').html(html2);

        html2 = `
          <td><input name='name' type='text' value='${name}' class='form-control input-md'></td>
        `;

        $('#'+$(this).val()).find('[headers="name"]').html(html2);

        html2 = `
          <td><input name='firstname' type='text' value='${firstname}' class='form-control input-md'></td>
        `;

        $('#'+$(this).val()).find('[headers="firstname"]').html(html2);

        html2 = `
          <td><input name='birthday' type='text' value='${birthday}' class='form-control input-md'></td>
        `;

        $('#'+$(this).val()).find('[headers="birthday"]').html(html2);

        html2 = `
          <td><input name='idTeam' type='text' value='${idTeam}' class='form-control input-md'></td>
        `;
        $('#'+$(this).val()).find('[headers="idTeam"]').html(html2);

        html2 = `
          <td><input name='email' type='text' value='${email}' class='form-control input-md'></td>
        `;
        $('#'+$(this).val()).find('[headers="email"]').html(html2);

        html2 = `
          <td><input name='displayImage' type='file' class='form-control input-md' accept="image/*"></td>
        `;
        $('#'+$(this).val()).find('[headers="displayImage"]').html(html2);

        html2 = `
          <td><button class='glyphicon glyphicon-ok' value=${idPlayers} type="submit" /><button class="glyphicon glyphicon-remove" value=${idPlayers} </td>
        `;
        $('#'+$(this).val()).find('[headers="button"]').html(html2);

      }
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
    alert(this.inputValues.idTeam);
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