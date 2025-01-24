declare namespace MercadoPago {
  interface CheckoutOptions {
    preference: {
      id: string;
    };
    render: {
      container: string;
      label: string;
    };
  }

  interface MercadoPagoInstance {
    checkout: (options: CheckoutOptions) => void;
  }

  interface MercadoPagoStatic {
    new (publicKey: string, options?: { locale: string }): MercadoPagoInstance;
  }
}

declare global {
  interface Window {
    MercadoPago: MercadoPagoStatic;
  }
}
