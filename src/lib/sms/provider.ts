export interface SendSmsResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface SmsProvider {
  sendSms(to: string, body: string): Promise<SendSmsResult>;
}

/**
 * Mock provider used until a real SMS gateway is configured. Logs instead of
 * actually sending — useful for local development and demos.
 */
class MockSmsProvider implements SmsProvider {
  async sendSms(to: string, body: string): Promise<SendSmsResult> {
    console.log(`[MockSmsProvider] Sending SMS to ${to}: "${body}"`);
    return {
      success: true,
      providerMessageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
  }
}

/**
 * SMSAPI.bg HTTP REST provider.
 * Docs: https://www.smsapi.bg/docs/
 * Requires SMSAPI_TOKEN (OAuth token from https://portal.smsapi.bg/react/oauth/manage)
 * and SMSAPI_SENDER (a sender name verified in the SMSAPI.bg panel).
 */
class SmsApiBgProvider implements SmsProvider {
  constructor(
    private token: string,
    private sender: string
  ) {}

  async sendSms(to: string, body: string): Promise<SendSmsResult> {
    const normalizedTo = to.replace(/^\+/, "").replace(/\s+/g, "");

    const params = new URLSearchParams({
      to: normalizedTo,
      from: this.sender,
      message: body,
      format: "json",
      encoding: "utf-8",
    });

    try {
      const response = await fetch(`https://api.smsapi.bg/sms.do?${params.toString()}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.token}` },
      });

      const data = await response.json();

      if (data.error) {
        return { success: false, error: `SMSAPI error ${data.error}: ${data.message}` };
      }

      const result = data.list?.[0];
      if (!result) {
        return { success: false, error: "SMSAPI: unexpected response format" };
      }

      return { success: true, providerMessageId: result.id };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "SMSAPI: network error",
      };
    }
  }
}

export function getSmsProvider(): SmsProvider {
  const token = process.env.SMSAPI_TOKEN;
  const sender = process.env.SMSAPI_SENDER;

  if (token && sender) {
    return new SmsApiBgProvider(token, sender);
  }

  return new MockSmsProvider();
}
