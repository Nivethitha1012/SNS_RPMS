const pool = require("../db");
const ExcelJS = require("exceljs");
const path = require("path");
const s3 = require("../aws");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const getDashboard = async (
    institutionId
) => {

    let filter = "";
    let params = [];

    if (institutionId) {

        filter =
            "WHERE u.institution_id = $1";

        params.push(
            institutionId
        );
    }

    const approved =
        await pool.query(
            `
    SELECT COUNT(*) total
    FROM submissions s
    JOIN users u
    ON s.user_id = u.user_id
    ${filter}
    ${filter ? "AND" : "WHERE"}
    s.status='Completed'
    `,
            params
        );

    const pending =
        await pool.query(
            `
    SELECT COUNT(*) total
    FROM submissions s
    JOIN users u
    ON s.user_id = u.user_id
    ${filter}
    ${filter ? "AND" : "WHERE"}
    s.status='Submitted'
    `,
            params
        );

    const totalPublications =
        await pool.query(
            `
    SELECT COUNT(*) total
    FROM submissions s
    JOIN users u
    ON s.user_id=u.user_id
    ${filter}
    `,
            params
        );

    const revenue =
        await pool.query(
            `
    SELECT
    COALESCE(
        SUM(amount),
        0
    ) total
    FROM payments p
    JOIN submissions s
    ON p.publication_id=s.publication_id
    JOIN users u
    ON s.user_id=u.user_id
    ${filter}
    ${filter ? "AND" : "WHERE"}
    p.payment_status='SUCCESS'
    `,
            params
        );

    const monthlyTrend =
        await pool.query(
            `
    SELECT
        EXTRACT(MONTH FROM s.submission_date) AS month_no,
        COUNT(*) AS total
    FROM submissions s
    JOIN users u
    ON s.user_id = u.user_id
    ${filter}
    GROUP BY EXTRACT(MONTH FROM s.submission_date)
    ORDER BY EXTRACT(MONTH FROM s.submission_date)
    `,
            params
        );

    const statusDistribution =
        await pool.query(
            `
    SELECT
        status,
        COUNT(*) total
    FROM submissions s
    JOIN users u
    ON s.user_id=u.user_id
    ${filter}
    GROUP BY status
    `,
            params
        );

    return {

        approved:
            Number(
                approved.rows[0].total
            ),

        pending:
            Number(
                pending.rows[0].total
            ),

        totalPublications:
            Number(
                totalPublications.rows[0].total
            ),

        totalRevenue:
            Number(
                revenue.rows[0].total
            ),

        monthlyTrend:
            monthlyTrend.rows,

        publicationStatus:
            statusDistribution.rows
    };
};
const exportDashboardData = async (institutionId) => {

    let filter = "";
    let params = [];

    if (institutionId) {

        filter = `
        WHERE u.institution_id = $1
        `;

        params.push(institutionId);
    }

    const result = await pool.query(
        `
        SELECT
            s.custom_publication_id,
            s.title,
            c.category_name,
            u.name,
            u.department,
            u.institution_name,
            s.status,
            s.submission_date
        FROM submissions s

        JOIN users u
        ON s.user_id = u.user_id

        JOIN categories c
        ON s.category_id = c.category_id

        ${filter}

        ORDER BY s.submission_date DESC
        `,
        params
    );

    const summary = await pool.query(
        `
        SELECT
            COUNT(*) total_publications,
            COUNT(*) FILTER (
                WHERE status='Completed'
            ) completed,
            COUNT(*) FILTER (
                WHERE status='Submitted'
            ) pending,
            COUNT(*) FILTER (
                WHERE status='Rejected'
            ) rejected
        FROM submissions s
        JOIN users u
        ON s.user_id=u.user_id
        ${filter}
        `,
        params
    );

    const workbook =
        new ExcelJS.Workbook();

    const sheet =
        workbook.addWorksheet(
            "RPMS Publications"
        );

    sheet.mergeCells("A1:H1");

    sheet.getCell("A1").value =
        "RPMS Publication Report";

    sheet.getCell("A1").font = {
        size: 18,
        bold: true
    };

    sheet.getCell("A1").alignment = {
        horizontal: "center"
    };

    sheet.mergeCells("A2:H2");

    sheet.getCell("A2").value =
        `Generated On : ${new Date().toLocaleString()}`;

    sheet.columns = [
        {
            header: "Publication ID",
            key: "custom_publication_id",
            width: 25
        },
        {
            header: "Title",
            key: "title",
            width: 40
        },
        {
            header: "Category",
            key: "category_name",
            width: 20
        },
        {
            header: "Faculty Name",
            key: "name",
            width: 25
        },
        {
            header: "Department",
            key: "department",
            width: 20
        },
        {
            header: "Institution",
            key: "institution_name",
            width: 30
        },
        {
            header: "Status",
            key: "status",
            width: 15
        },
        {
            header: "Submission Date",
            key: "submission_date",
            width: 25
        }
    ];

    sheet.spliceRows(
        3,
        0,
        []
    );

    const headerRow =
        sheet.getRow(4);

    headerRow.font = {
        bold: true,
        color: {
            argb: "FFFFFF"
        }
    };

    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
            argb: "1F4E78"
        }
    };

    headerRow.alignment = {
        horizontal: "center"
    };

    sheet.views = [
        {
            state: "frozen",
            ySplit: 4
        }
    ];

    result.rows.forEach(row => {

        const excelRow =
            sheet.addRow(row);

        if (
            row.status === "Submitted" ||
            row.status === "Pending"
        ) {

            excelRow.eachCell(cell => {

                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: {
                        argb: "FFF2CC"
                    }
                };

            });

        }

        else if (
            row.status === "Completed"
        ) {

            excelRow.eachCell(cell => {

                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: {
                        argb: "C6EFCE"
                    }
                };

            });

        }

        

    });

    sheet.eachRow(row => {

        row.eachCell(cell => {

            cell.border = {
                top: {
                    style: "thin"
                },
                left: {
                    style: "thin"
                },
                bottom: {
                    style: "thin"
                },
                right: {
                    style: "thin"
                }
            };

        });

    });

    const stats =
        summary.rows[0];

    sheet.getCell("J2").value =
        "Dashboard Summary";

    sheet.getCell("J2").font = {
        bold: true,
        size: 14
    };

    sheet.getCell("J4").value =
        "Total Publications";

    sheet.getCell("K4").value =
        stats.total_publications;

    sheet.getCell("J5").value =
        "Completed";

    sheet.getCell("K5").value =
        stats.completed;

    sheet.getCell("J6").value =
        "Pending";

    sheet.getCell("K6").value =
        stats.pending;

   

    const buffer =
        await workbook.xlsx.writeBuffer();

    const key =
        `reports/publications_${Date.now()}.xlsx`;

    await s3.send(
        new PutObjectCommand({
            Bucket:
                process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        })
    );

    const downloadUrl =
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
        downloadUrl
    };
};

module.exports = {
    getDashboard,
    exportDashboardData
};