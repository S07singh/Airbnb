const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string(),
        price: Joi.number().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        // image: Joi.object({
        //     filename: Joi.string().required(),
        //     url: Joi.string().required()
        // })
    }).required()

})