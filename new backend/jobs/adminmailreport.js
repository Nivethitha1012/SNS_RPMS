const cron = require("node-cron");

const pool = require("../db");

const transporter =
require("../mailconfig");

cron.schedule(
    "0 18 * * *",
    async () => {

        try {

            const result =
            await pool.query(
            `
            SELECT

                u.name,

                u.department,

                s.title

            FROM submissions s

            JOIN users u
            ON s.user_id = u.user_id

            WHERE
            s.submission_date >=
            NOW() - INTERVAL '24 HOURS'
            `
            );

            let html = `
            <h2>
            Daily Publication Report
            </h2>
            `;

            result.rows.forEach(
                (row,index) => {

                    html += `
                    <p>
                    ${index + 1}.
                    ${row.name}

                    <br>

                    Department:
                    ${row.department}

                    <br>

                    Title:
                    ${row.title}
                    </p>
                    `;
                }
            );

            html += `
            <hr>
            Total Submissions:
            ${result.rows.length}
            `;

            await transporter.sendMail({

                from:
                process.env.MAIL_USER,

                to:
                process.env.ADMIN_EMAIL,

                subject:
                "Daily Submission Report",

                html

            });

        } catch(error){

            console.log(error);

        }

    }
);