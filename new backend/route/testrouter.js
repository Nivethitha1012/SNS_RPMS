const express = require("express");
const router = express.Router();

const transporter =
require("../mailconfig");

router.get("/test-mail", async (req, res) => {

    try {

        await transporter.sendMail({

            from: process.env.MAIL_USER,

            to: "ramkr.a.ad.2024@snsce.ac.in",

            subject: "RPMS Test Mail",

            html: `
                <h2>RPMS Test Mail</h2>
                <p>Email configuration is working successfully.</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Mail Sent Successfully"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

module.exports = router;