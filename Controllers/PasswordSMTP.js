const axios = require('axios');

const sendEmail = async (email, tempPassword) => {
    const serviceId = process.env.SMTP_SERVICE_ID;
    const templateId = process.env.SMTP_TEMPLATEID;
    const userId = process.env.SMTP_USERID;

    const templateParams = {
        email: email,
        passcode: tempPassword
    };

    try {
        const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
            service_id: serviceId,
            template_id: templateId,
            user_id: userId,
            template_params: templateParams
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Email sent: %s", response.data);
    } catch (error) {
        console.error("Failed to send email: %s", error.response ? error.response.data : error.message);
        throw new Error('Failed to send email'); 
    }
};

module.exports = { sendEmail };
