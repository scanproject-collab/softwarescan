import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',  
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendResetPasswordEmail = async (email: string, code: string) => {
  try {
    const now = new Date().toLocaleString('pt-BR'); 
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Solicitação de Redefinição de Senha',
      html: `
        <p>Olá <strong>${email}</strong>,</p>
        <p>Recebemos uma solicitação para alteração de senha da plataforma Scan. Se você não foi o responsável por essa solicitação, por favor, desconsidere este e-mail.</p>
        <p><strong>Código de verificação:</strong> ${code}</p>
        <p>Este código foi gerado em: ${now}</p>
        <p><em>Se não foi você quem solicitou a alteração de senha, por favor, ignore este e-mail.</em></p>
        <p>Atenciosamente, <br/>Equipe da Plataforma Scan</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail de redefinição de senha enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar e-mail de redefinição de senha:', error);
    throw new Error('Erro ao enviar e-mail');
  }
};

export const sendWelcomeEmail = async (email: string, name?: string) => {
  try {
    const displayName = name || email.split('@')[0]; // Fallback to email prefix if no name
    const now = new Date().toLocaleString('pt-BR');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Bem-vindo(a) à Plataforma Scan!',
      html: `
        <p>Olá <strong>${displayName}</strong>,</p>
        <p>Seja muito bem-vindo(a) à Plataforma Scan! Estamos felizes em tê-lo(a) conosco.</p>
        <p>Sua conta foi criada com sucesso em: ${now}</p>
        <p>Com a Scan, você poderá [descreva brevemente o propósito da plataforma, ex.: "gerenciar projetos, colaborar com sua equipe e muito mais"].</p>
        <p>Se precisar de ajuda, não hesite em entrar em contato com nossa equipe de suporte.</p>
        <p>Atenciosamente, <br/>Equipe da Plataforma Scan</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail de boas-vindas enviado com sucesso para:', email);
  } catch (error) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error);
    throw new Error('Erro ao enviar e-mail de boas-vindas');
  }
};