const isSmsApiConfigured = !!process.env.SMSAPI_TOKEN && !!process.env.SMSAPI_SENDER;

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Настройки</h1>

      <div className="mt-6 max-w-xl rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">SMS доставчик</h2>
          <span
            className={
              isSmsApiConfigured
                ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                : "rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
            }
          >
            {isSmsApiConfigured ? "SMSAPI.bg активен" : "Тестов (mock) режим"}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {isSmsApiConfigured ? (
            <>
              Съобщенията се изпращат реално през SMSAPI.bg.
            </>
          ) : (
            <>
              В момента съобщенията само се записват в историята и не се
              изпращат реално. За да активирате реално изпращане през
              SMSAPI.bg:
            </>
          )}
        </p>
        {!isSmsApiConfigured && (
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            <li>
              Регистрирайте акаунт в{" "}
              <a
                href="https://www.smsapi.bg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                smsapi.bg
              </a>{" "}
              и заредете кредит.
            </li>
            <li>Заявете и верифицирайте sender name (име на подателя).</li>
            <li>
              Генерирайте OAuth token от{" "}
              <a
                href="https://portal.smsapi.bg/react/oauth/manage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                portal.smsapi.bg
              </a>
              .
            </li>
            <li>
              Задайте <code className="rounded bg-slate-100 px-1">SMSAPI_TOKEN</code> и{" "}
              <code className="rounded bg-slate-100 px-1">SMSAPI_SENDER</code> в{" "}
              <code className="rounded bg-slate-100 px-1">.env</code> и рестартирайте сървъра.
            </li>
          </ol>
        )}
      </div>

      <div className="mt-6 max-w-xl rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Плащания</h2>
        <p className="mt-2 text-sm text-slate-600">
          Плащанията се обработват през Stripe. Задайте{" "}
          <code className="rounded bg-slate-100 px-1">STRIPE_SECRET_KEY</code>,{" "}
          <code className="rounded bg-slate-100 px-1">STRIPE_WEBHOOK_SECRET</code> и{" "}
          <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
          в средата, за да активирате реални плащания.
        </p>
      </div>
    </div>
  );
}
