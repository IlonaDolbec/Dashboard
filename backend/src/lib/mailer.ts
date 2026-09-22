import nodemailer from "nodemailer";

let transporterPromise: Promise<ReturnType<typeof nodemailer.createTransport>> | null = null;

function getTransporter() {
    if (!transporterPromise) {
        transporterPromise = nodemailer.createTestAccount().then((account) =>
            nodemailer.createTransport({
                host: account.smtp.host,
                port: account.smtp.port,
                secure: account.smtp.secure,
                auth: { user: account.user, pass: account.pass },
            }),
        );
    }
    return transporterPromise;
}

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
        from: '"Dashboard" <no-reply@dashboard.local>',
        to,
        subject,
        html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[mailer] "${subject}" sent to ${to}${previewUrl ? ` — preview: ${previewUrl}` : ""}`);
}
