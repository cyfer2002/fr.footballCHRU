import ReplaceFlash from '../lib/loginuser';

export default class CheckBoxForm {
  constructor(form) {
    this.$form = $(form);
    this.$checkBox = this.$form.find('[type="checkbox"]');
    if (!this.$form.length) return;

    //this.$checkBox.on('click', (e) => this.openChange(e));
  }

  onClick(e) {
    // Stop submit event
    e.preventDefault();

    let html = `
    <div>Salut </div>
    `;
    $('#2').find('[type="checkbox"]').replaceWith(html);
    //this.$checkBox.replaceWith(html);
    
    // Display spinner
    // var $button = this.$form.find('[type="checkbox"]').prop('disabled', true);
    
  }

  openChange(id) {

    console.log(id);
    alert(id);
    let html = `
    <div>Salut </div>
    `;
    $('#2'+id).find('[type="checkbox"]').replaceWith(html);
  }
}