  /**
   * Begin form config
   */
   var gwApiKey = 'pub-groundwork-test.nycha-development--1cTuIZ6ml4RGjyBNN2XdK_oct7himu0YpQXJIZfP1rPMiDVGo5lcm9ESVs5JtvDhqGFdeNlejplWI2EabuVe3A';
   var fundraiserId = '5457ab00-1fa3-4e73-9236-1295fc587ac6';
   var amountInitial = 25;
   var amountValues = [25, 50, 100, ];
   var source = 'gw-fundraise-dev';
   var stripePercentage = 2.2;
   var stripeCentsPer = 30;
   var gwCentsPer = 10;
   /**
	* End form config
	*/
 
   var gw = new Groundwork({
	 apiKey: gwApiKey
   });
   var state = {};
 
   function calculateTotal(cents) {
	 var percentToCents = cents * (stripePercentage / 100);
	 var processingFee = percentToCents + stripeCentsPer + gwCentsPer;
 
	 return {
	   processingFee: processingFee,
	   total: cents,
	   totalPlusFees: cents + processingFee
	 }
   }
 
   function renderSuccess(paymentData) {
	 var formattedAmount = gw.donations.formatCurrency(
	   paymentData.data.donation.amount, 'USD');
 
	 var msg = '<div class="form-submission-text">' +
	   '<h3>Thank you for your contribution</h3>' +
	   '<p>Your credit card will be charged <b>' + formattedAmount + '</b></p>';
 
	 $('#payment-form').html(msg);
   }
 
  
   function getInvalidFields(data) {
	 var fields = [];
 
	
	 if (data && data.error && data.error.fields) {
	   fields = data.error.fields;
	 } else if (data && data.code && data.message) {
	 
	   if (Number(data.code) === 400 && data.details) {
		 fields = Object.keys(data.details);
	   } else {
		 fields = fields.concat(data);
	   }
	 } else if (data) {
	 
	   var keys = Object.keys(data);
	   if (keys) {
		 keys.forEach(function(key) {
		   if (data[key] && data[key].fields) {
			 fields = fields.concat(data[key].fields);
		   }
		 });
	   }
	 };
 
	 return fields;
   }
 
   function formErrMsg() {
	 return '<div class="field-error">Your form has encountered a problem. Please check the form and try again.</div>';
   }
 
   function fieldErrMsg(fieldName) {
	 return '<div class="field-error">' + fieldName + ' is required.</div>';
   }
 
   function onPaymentError(err) {
	 getInvalidFields(err.data).forEach(function(field) {
	   var el = null;
	   // Special handling for expiration.
	   if (field === 'expiration') {
		 field = 'ccExpYear';
	   }
	   
	   if (typeof field === 'string') {
		 el = $('[name=payment-' + field + ']');
	   }
 
	   if (el) {
		 var parent = el.parents('.form-item');
		 var friendlyName = parent.find('.title').text().replace(' *', '').trim();
 
	  
		 parent.find('.field-error').remove();
		 parent.addClass('error').prepend(fieldErrMsg(friendlyName));
	   }
	 });
 
	 $('.field-list').before(formErrMsg()).after(formErrMsg());
	 $('#form-button').removeClass('btn-working').removeAttr('disabled');
   }
 
   function onPaymentSuccess(res) {
	 renderSuccess(res);
   }
 
   function makePayment(paymentData) {
	 var gwMethod = paymentData.isRecurring ? gw.subscriptions : gw.donations;
	 gwMethod.create(paymentData)
	   .then(onPaymentSuccess)
	   .catch(onPaymentError);
   }
 
  
   function dataFromForm(elements) {
	 var data = {
	   source: source,
	   fundraising: {
		 fundraiserId: fundraiserId
	   }
	 };
 
	 var comments = '';
	 var honoree = null;
 
	 for (var i = 0; i < elements.length; i += 1) {
	   var el = elements[i];
 
	  
	   var elName = el.name;
	   var key = elName ? elName.replace('payment-', '') : null;
 
	   if (key) {
		 var val = el.value;
 
		 if (val.length !== 0 && val !== '0') {
		   if (key.match('ccExp') || key === 'amount') {
			 val = parseInt(el.value, 10);
		   }
 
		   switch (key) {
			 case 'recurring':
			   data.isRecurring = el.checked;
			   break;
			 case 'comments':
			   comments += 'Comment: ' + val;
			   break;
			 case 'honoree':
			   honoree = val;
			   break;
		   }
 
		   data[key] = val;
		 }
	   }
	 }
 
	 if (honoree) {
	   comments += (comments.length) ? ' | ' : '';
	   comments += data.honor + ' ' + honoree;
	 }
 
	 if (comments.length) {
	   data.fundraising.comment = comments;
	 }
 
 
	 delete data.recurring;
	 delete data.otherAmount;
	 delete data.coverFee;
	 delete data.honor;
	 delete data.honoree;
 
	 
	 data.agreeToTerms = true;
 
   
	 data.phone = '';
 
	 data.occupation = '';
	 data.employer = '';
 
	 return data;
   }
 
   function onFormSubmit(event) {
	 event.preventDefault();
	 var data = dataFromForm(event.target.elements);
	 $('.error').removeClass('error');
	 $('.field-error').remove();
	 $('#form-button').addClass('btn-working').attr('disabled', 'disabled');
	 makePayment(data);
   }
 
   function renderTotal() {
	 var coverFees = $('[name=payment-coverFee]').is(':checked');
	 var total = coverFees ? state.total.totalPlusFees : state.total.total;
	 var formatted = gw.donations.formatCurrency(total, 'USD');
	 var feesFormatted = gw.donations.formatCurrency(
	   state.total.processingFee, 'USD');
 
	 $('.processing-fee-display').text(feesFormatted);
	 $('.payment-total-amount').text(formatted);
	 $('[name=payment-amount]').val(total);
   }
 
   function amountClickHandler(event) {
	 event.preventDefault();
	 $('.payment-amount-buttons button').removeClass('active');
 
	 var btn = $(event.target);
	 btn.addClass('active');
	 var amt = btn.attr('data-amount');
	 state.total = calculateTotal(amt * 100);
	 renderTotal();
 
	 $('[name=payment-otherAmount]').val('');
   }
 
   function renderAmountButtons(vals) {
	 var initialAmtIndex = vals.indexOf(parseFloat(amountInitial));
 
	 var html = vals.map(function(a, i) {
	   var amt = parseFloat(a);
	   var className = 'button sqs-system-button sqs-editable-button';
 
	   if (i === initialAmtIndex) {
		 className += ' active';
	   }
	   return '<div class="button-container"><button type="button" data-amount="' + amt + '" class="' + className +
		 '">$' + amt + '</button></div>';
	 }).join('');
 
	 $('.payment-amount-buttons').on('click', 'button', amountClickHandler).html(html);
   }
 
   function otherAmountInputHandler(event) {
	 var amt = $(event.target).val();
	 state.total = calculateTotal(amt * 100);
 
	 if (amt.length === 1) {
	   $('.payment-amount-buttons button').removeClass('active');
	 }
 
	 renderTotal();
   }
 
   function honorChangeHandler(event) {
	 var target = $(event.target);
	 var honoree = $('#payment-honoree');
	 var parent = honoree.parents('.field');
 
	 if (target.val() !== '0') {
	   parent.removeAttr('hidden');
	 } else {
	   parent.attr('hidden', true);
	   honoree.val('');
	 }
   }
 
   function renderOtherAmount(initialAmt, vals) {
	 var input = $('[name=payment-otherAmount]');
	 var initialAmtIndex = vals.indexOf(parseFloat(initialAmt));
	 var otherVal = initialAmt > 0 && initialAmtIndex < 0 ? parseFloat(initialAmt) : null;
 
	 if (otherVal) {
	   input.val(otherVal);
	 }
 
	 input.on('input', otherAmountInputHandler);
   }
 
   $(function() {
	 state.total = calculateTotal(amountInitial * 100);
 
	 renderTotal();
	 renderAmountButtons(amountValues);
	 renderOtherAmount(amountInitial, amountValues);
 
	 $('[name=payment-coverFee]').on('change', renderTotal);
	 $('#payment-honor').on('change', honorChangeHandler);
	 $('#payment-form').on('submit', onFormSubmit);
 
	 var fixtures = [{
	   agreeToTerms: true,
	   givenName: 'Christina',
	   familyName: 'Ainsley',
	   email: 'chrissy.ainsley123@testmail.com',
	   employer: 'Acme, Inc.',
	   occupation: 'Worker',
	   phone: '555-555-5555',
	   ccNum: '4222222222222',
	   ccExpMonth: '01',
	   ccExpYear: '2022',
	   ccCvc: '367',
	   address1: '525 Lorimer St',
	   address2: 'Apt 2A',
	   city: 'Brooklyn',
	   state: 'NY',
	   zip: '11215',
	   source: 'gw-fundraise-dev'
	 }];
	 $('#populate-btn').on('click', function(event) {
	   event.preventDefault();
	   var data = fixtures[0];
	   for (var k in data) {
		 var el = $('[name=payment-' + k + ']');
 
		 if (el) {
		   el.val(data[k]);
		 }
	   }
	 });
   });