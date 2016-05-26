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
        let displayImage = $('#' + $(this).val()).find('img').attr('src');
        let email = $('#' + $(this).val()).find('[headers="email"]').text();

        var html2 = `
        <div class="form-group">
            <td headers="idPlayers"><input name='idPlayers' type='text' value='${idPlayers}' class='form-control input-md' readonly="readonly"></td>
        </div>
        <div class="form-group">
            <td headers="name"><input name='name' type='text' value='${name}' class='form-control input-md'></td>
        </div>
        <div class="form-group">
            <td headers="firstname"><input name='firstname' type='text' value='${firstname}' class='form-control input-md'></td>
        </div>
        <div class="form-group">
            <td headers="birthday"><input name='birthday' type='date' value='${birthday}' class='form-control input-md'></td>
        </div>
        <div class="form-group">
            <td headers="idTeam"><input name='idTeam' type='text' value='${idTeam}' class='form-control input-md'></td>
        </div>
        <div class="form-group">
            <td headers="email"><input name='email' type='text' value='${email}' class='form-control input-md'></td>
        </div>
        <div class="form-group">
            <td headers="displayImage">
                <img src='${displayImage}' id='cropbox' width='120' height='120' class='img-rounded'>
            </td>
        </div>
        <td headers="button">
          <button class='glyphicon glyphicon-ok' value=${idPlayers} type="submit">V</button>
          <button class="glyphicon glyphicon-remove" value=${idPlayers}>X</button>
        </td>
      `;

        $(`tr[id=${idPlayers}]`).each(function () {
          let elemH2 = $(this);
          elemH2.replaceWith(`<tr id=${idPlayers}> ${html2} </tr>`);
        });
      }
    });
  }

  resetForm(idPlayers){
    this.idPlayers = $(idPlayers);
    $(`tr[id=${this.idPlayers}]`).each(function () {
      let name = $('#' + $(this).val()).find('[headers="name"]').text();
      let firstname = $('#' + $(this).val()).find('[headers="firstname"]').text();
      let birthday = $('#' + $(this).val()).find('[headers="birthday"]').text();
      let idTeam = $('#' + $(this).val()).find('[headers="idTeam"]').text();
      let displayImage = $('#' + $(this).val()).find('img').attr('src');
      let email = $('#' + $(this).val()).find('[headers="email"]').text();

      var html2 = `
        <div class="form-group">
            <td headers="idPlayers">${this.idPlayers}</td>
        </div>
        <div class="form-group">
            <td headers="name">${name}</td>
        </div>
        <div class="form-group">
            <td headers="firstname">${firstname}</td>
        </div>
        <div class="form-group">
            <td headers="birthday">${birthday}</td>
        </div>
        <div class="form-group">
            <td headers="idTeam">${idTeam}</td>
        </div>
        <div class="form-group">
            <td headers="email">${email}</td>
        </div>
        <div class="form-group">
            <td headers="displayImage">
                <img src='${displayImage}' id='cropbox' width='120' height='120' class='img-rounded'>
            </td>
        </div>
        <td headers="button">
          <input type='checkbox' name='modification' value='${this.idPlayers}'/>
        </td>
      `;

      let elemH2 = $(this);
      elemH2.replaceWith(`<tr id=${this.idPlayers}> ${html2} </tr>`);
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
          alert(this.inputValues.idPlayers)
          resetForm(this.inputValues.idPlayers);
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