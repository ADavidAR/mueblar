package project.backendmueblar.modules.auth.services;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendRecoveryEmail(String recipientEmail, String token, String id) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("mueblar@muebl.lat");
            helper.setTo(recipientEmail);
            helper.setSubject("MueblAR - Recuperación de Contraseña");

            String urlRecoveryPassword = "http://localhost:5173/reset-password/" + token + "/" + id;
            System.out.println(urlRecoveryPassword);

            String contenidoHtml =
                    "<div style=\"font-family: Arial, sans-serif; text-align: center; padding: 30px; color: #333;\">" +
                            "<h2 style=\"color: #2c3e50;\">Recuperación de Contraseña</h2>" +
                            "<p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en MueblAR.</p>" +
                            "<p>Haz clic en el siguiente botón para crear una nueva:</p>" +
                            "<br>" +
                            "<a href=\"" + urlRecoveryPassword + "\" style=\"display: inline-block; padding: 12px 24px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;\">" +
                            "Restablecer mi contraseña" +
                            "</a>" +
                            "<br><br>" +
                            "<p style=\"font-size: 12px; color: #777;\">Este enlace expirará en 15 minutos.</p>" +
                            "<p style=\"font-size: 12px; color: #777;\">Si no solicitaste este cambio, puedes ignorar este correo con seguridad.</p>" +
                            "</div>";

            helper.setText(contenidoHtml, true);
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error inesperado al intentar enviar el correo HTML", e);
        }
    }
}