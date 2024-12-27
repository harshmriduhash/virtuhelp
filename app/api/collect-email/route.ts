import { NextResponse } from "next/server";
import { createTransport } from "nodemailer";
import { writeFile } from "fs/promises";
import path from "path";

// Configure email transporter
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Save email to CSV
    const date = new Date().toISOString();
    const csvLine = `${email},${date}\n`;
    await writeFile("@/public/leads.csv", csvLine, { flag: "a" });

    // Send email with PDF
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Your Free Business Success Guide",
      html: `
        <h1>Thank You for Your Interest!</h1>
        <p>Here's your free guide to business success strategies.</p>
        <p>We hope you find these insights valuable for your entrepreneurial journey.</p>
        <br>
        <p>Best regards,</p>
        <p>VirtuHelpX Team</p>
      `,
      attachments: [
        {
          filename: "business-success-guide.pdf",
          path: path.join(
            process.cwd(),
            "public",
            "pdf",
            "business-success-guide.pdf"
          ),
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
