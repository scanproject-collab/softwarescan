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

export const sendVerificationEmail = async (email: string, code: string) => {
  try {
    const now = new Date().toLocaleString('pt-BR');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Código de Verificação - Plataforma Scan',
      html: `
        <p>Olá,</p>
        <p>Você está recebendo este código de verificação para o email <strong>${email}</strong> na Plataforma Scan.</p>
        <p>Este email pode ter sido enviado para:</p>
        <ul>
          <li>Verificar seu email para registro de uma nova conta</li>
          <li>Atualizar o email da sua conta existente</li>
        </ul>
        <p><strong>Código de verificação:</strong> ${code}</p>
        <p>Este código foi gerado em: ${now} e expira em 30 minutos.</p>
        <p>Se você não solicitou este código, ignore este email.</p>
        <p>Atenciosamente, <br/>Equipe da Plataforma Scan</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail de verificação enviado com sucesso para:', email);
  } catch (error) {
    console.error('Erro ao enviar e-mail de verificação:', error);
    throw new Error('Erro ao enviar e-mail de verificação');
  }
};

export const sendWelcomeEmail = async (email: string, name?: string, role?: string) => {
  try {
    const displayName = name || email.split('@')[0];
    const now = new Date().toLocaleString('pt-BR');
    let message = '';

    if (role === 'ADMIN') {
      message = 'Agora você é o administrador da Plataforma Scan e poderá visualizar todas as interações, criar tags para interações, aprovar ou rejeitar operadores e muito mais.';
    } else if (role === 'MANAGER') {
      message = 'Agora você é o gerente da Plataforma Scan e poderá visualizar todas as interações, criar tags e aprovar ou rejeitar operadores da sua instituição.';
    } else {
      message = 'Com a Scan, você poderá criar interações em diversos lugares na região de Maceió - AL.';
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Bem-vindo(a) à Plataforma Scan!',
      html: `
        <p>Olá <strong>${displayName}</strong>,</p>
        <p>Seja muito bem-vindo(a) à Plataforma Scan! Estamos felizes em tê-lo(a) conosco.</p>
        <p>Sua conta foi criada com sucesso em: ${now}</p>
        <p>${message}</p>
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
        <p>Este código foi gerado em: ${now} e expira em 15 minutos.</p>
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

export const sendPendingApprovalEmail = async (email: string, name: string | null, expiresAt: Date) => {
  try {
    const displayName = name || email.split('@')[0];
    const expiresAtFormatted = expiresAt.toLocaleString('pt-BR');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Registro na Plataforma Scan - Aguardando Aprovação',
      html: `
        <p>Olá <strong>${displayName}</strong>,</p>
        <p>Seu registro na Plataforma Scan foi realizado com sucesso!</p>
        <p>No momento, sua conta está aguardando aprovação por um administrador. Você poderá fazer login apenas após a aprovação, que deve ocorrer até ${expiresAtFormatted}.</p>
        <p>Caso sua conta não seja aprovada até essa data, ela será automaticamente removida. Se tiver dúvidas, entre em contato com nossa equipe pelo e-mail: suporte@scan.com.</p>
        <p>Atenciosamente, <br/>Equipe da Plataforma Scan</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail de aprovação pendente enviado com sucesso para:', email);
  } catch (error) {
    console.error('Erro ao enviar e-mail de aprovação pendente:', error);
    throw new Error('Erro ao enviar e-mail');
  }
};

export const sendExpirationEmail = async (email: string, name: string) => {
  try {
    const displayName = name || email.split('@')[0];
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Sua Conta na Plataforma Scan Expirou',
      html: `
        <p>Olá <strong>${displayName}</strong>,</p>
        <p>Informamos que sua solicitação de registro na Plataforma Scan não foi aprovada dentro do prazo estipulado e, por isso, sua conta foi removida do sistema.</p>
        <p>Caso tenha dúvidas ou precise de assistência, entre em contato com nossa equipe pelo e-mail: suporte@scan.com.</p>
        <p>Atenciosamente, <br/>Equipe da Plataforma Scan</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail de expiração enviado com sucesso para:', email);
  } catch (error) {
    console.error('Erro ao enviar e-mail de expiração:', error);
    throw new Error('Erro ao enviar e-mail');
  }
};

export const sendRejectionEmail = async (email: string, name: string | null) => {
  try {
    const displayName = name || email.split('@')[0];
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Solicitação de Registro na Plataforma Scan Rejeitada',
      html: `
        <p>Olá <strong>${displayName}</strong>,</p>
        <p>Informamos que sua solicitação de registro na Plataforma Scan foi rejeitada pelo administrador.</p>
        <p>Caso tenha dúvidas ou precise de esclarecimentos, entre em contato com nossa equipe pelo e-mail: suporte@scan.com.</p>
        <p>Atenciosamente, <br/>Equipe da Plataforma Scan</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail de rejeição enviado com sucesso para:', email);
  } catch (error) {
    console.error('Erro ao enviar e-mail de rejeição:', error);
    throw new Error('Erro ao enviar e-mail');
  }
};