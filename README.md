<h1>Trabalho de Conclusão de Curso</h1>
<h3>Aplicação Web para Segurança Feminina - Selene</h3>
<h2>Participantes:</h2>
Gabrielly Leite de Macedo - SP3115763 | (GabyyMacedo) <br>
Maria Eduarda de Araujo Souza - SP3115895 | (mariaeduarda9999) <br>
Mayara Matilde Cardoso de Freitas - SP3115178 | (MayMatilde) <br>
Mirella Prado Santos - SP3124568 | (mirprado) <br>
Rafael Gomes Messias - SP3124819 | (Rafael0978) <br>
Yasmin Catherinne Conceição Bastos - SP3116212 | (yasminbastos) <br>

## WhatsApp automático no SOS

O envio usa uma Cloud Function autenticada; o token da Meta nunca fica dentro do APK.

1. No WhatsApp Manager, crie e aprove o modelo `zella_sos_alert` em `pt_BR`, com o corpo
   `🚨 {{1}} precisa de ajuda agora! Localização: {{2}}`.
2. Grave o token permanente da Meta como secret `WHATSAPP_ACCESS_TOKEN`.
3. Instale as dependências em `functions/` e publique `sendSosWhatsapp` no Firebase
   `zella-f34bd`.
4. Cada contato deve preencher seu telefone com DDD/DDI e ativar **Receber alertas SOS
   pelo WhatsApp** em **Meus Dados**.

```powershell
npx firebase-tools functions:secrets:set WHATSAPP_ACCESS_TOKEN
npx firebase-tools deploy --only functions:sendSosWhatsapp
```

No deploy, configure `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME`,
`WHATSAPP_TEMPLATE_LANGUAGE` e `WHATSAPP_GRAPH_VERSION` quando solicitado.
