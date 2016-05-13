
var REG_EMAIL = /^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
var REG_IMAGE = /(.*?)\.(jpg|jpeg|gif|png)$/i;

export default function checkInscriptionForm(inputs) {
  var errors = {};
  if (!inputs.name.trim()) {
    errors.name = 'Ce champ est requis';
  }
  if (!inputs.firstname.trim()) {
    errors.firstname = 'Ce champ est requis';
  }
  if (!inputs.birthday.trim()) {
    errors.birthday = 'Ce champ est requis';
  }
  if (inputs.displayImage.trim()) {
    if (!REG_IMAGE.test(inputs.displayImage)) {
      errors.displayImage = 'Votre image n\'est pas au bon format';
    }
  }
  if (!inputs.email.trim()) {
    errors.email = 'Ce champ est requis';
  } else if (!REG_EMAIL.test(inputs.email)) {
    errors.email = 'Addresse email invalide';
  }
  if (!inputs.idTeam.trim()) {
    errors.idTeam = 'Ce champ est requis';
  }
  return errors;
}
