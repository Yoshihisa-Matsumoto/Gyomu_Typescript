import { Schema } from 'effect';
export declare const AppInfoSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly mailFromAddress: Schema.NullOr<Schema.String>;
        readonly mailFromName: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly mailFromAddress: Schema.NullOr<Schema.String>;
        readonly mailFromName: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly mailFromAddress: Schema.NullOr<Schema.String>;
        readonly mailFromName: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly mailFromAddress: Schema.NullOr<Schema.String>;
        readonly mailFromName: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
        readonly mailFromAddress: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly mailFromName: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly description: Schema.String;
        readonly mailFromAddress: Schema.NullOr<Schema.String>;
        readonly mailFromName: Schema.NullOr<Schema.String>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly description: Schema.String;
        readonly mailFromAddress: Schema.NullOr<Schema.String>;
        readonly mailFromName: Schema.NullOr<Schema.String>;
    }>, Schema.Struct<{
        readonly description: Schema.toEncoded<Schema.String>;
        readonly mailFromAddress: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly mailFromName: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly description: Schema.String;
        readonly mailFromAddress: Schema.NullOr<Schema.String>;
        readonly mailFromName: Schema.NullOr<Schema.String>;
    }, "mailFromAddress" | "mailFromName" | "description">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly description: Schema.String;
        readonly mailFromAddress: Schema.NullOr<Schema.String>;
        readonly mailFromName: Schema.NullOr<Schema.String>;
    }, "mailFromAddress" | "mailFromName" | "description">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly mailFromAddress: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly mailFromName: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly description: Schema.toEncoded<Schema.optional<Schema.String>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly mailFromAddress: string | null;
            readonly mailFromName: string | null;
            readonly description: string;
        } | {
            readonly id: string;
            readonly mailFromAddress: string | null;
            readonly mailFromName: string | null;
            readonly description: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly mailFromAddress: string | null;
            readonly mailFromName: string | null;
            readonly description: string;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly mailFromAddress?: string | null | undefined;
            readonly mailFromName?: string | null | undefined;
            readonly description?: string | undefined;
        } | {
            readonly id: string;
            readonly mailFromAddress?: string | null | undefined;
            readonly mailFromName?: string | null | undefined;
            readonly description?: string | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly description: Schema.String;
        readonly mailFromAddress: Schema.NullOr<Schema.String>;
        readonly mailFromName: Schema.NullOr<Schema.String>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("mailFromAddress" | "mailFromName" | "description")[] | undefined;
    };
    ui: Partial<{
        readonly description?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly mailFromAddress?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly mailFromName?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const StatusTypeSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly description: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly description: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly description: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly description: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly description: Schema.NullOr<Schema.String>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly description: Schema.NullOr<Schema.String>;
    }>, Schema.Struct<{
        readonly description: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly description: Schema.NullOr<Schema.String>;
    }, "description">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly description: Schema.NullOr<Schema.String>;
    }, "description">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly description: string | null;
        } | {
            readonly id: string;
            readonly description: string | null;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly description: string | null;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly description?: string | null | undefined;
        } | {
            readonly id: string;
            readonly description?: string | null | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly description: Schema.NullOr<Schema.String>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly "description"[] | undefined;
    };
    ui: Partial<{
        readonly description?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const StatusHandlerSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly region: Schema.NullOr<Schema.String>;
        readonly statusTypeId: Schema.String;
        readonly recipientAddress: Schema.NullOr<Schema.String>;
        readonly recipientType: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly region: Schema.NullOr<Schema.String>;
        readonly statusTypeId: Schema.String;
        readonly recipientAddress: Schema.NullOr<Schema.String>;
        readonly recipientType: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly region: Schema.NullOr<Schema.String>;
        readonly statusTypeId: Schema.String;
        readonly recipientAddress: Schema.NullOr<Schema.String>;
        readonly recipientType: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly region: Schema.NullOr<Schema.String>;
        readonly statusTypeId: Schema.String;
        readonly recipientAddress: Schema.NullOr<Schema.String>;
        readonly recipientType: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly region: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly statusTypeId: Schema.toEncoded<Schema.String>;
        readonly recipientAddress: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly recipientType: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly region: Schema.NullOr<Schema.String>;
        readonly statusTypeId: Schema.String;
        readonly recipientAddress: Schema.NullOr<Schema.String>;
        readonly recipientType: Schema.NullOr<Schema.String>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly region: Schema.NullOr<Schema.String>;
        readonly statusTypeId: Schema.String;
        readonly recipientAddress: Schema.NullOr<Schema.String>;
        readonly recipientType: Schema.NullOr<Schema.String>;
    }>, Schema.Struct<{
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly region: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly statusTypeId: Schema.toEncoded<Schema.String>;
        readonly recipientAddress: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly recipientType: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly region: Schema.NullOr<Schema.String>;
        readonly statusTypeId: Schema.String;
        readonly recipientAddress: Schema.NullOr<Schema.String>;
        readonly recipientType: Schema.NullOr<Schema.String>;
    }, "region" | "applicationId" | "statusTypeId" | "recipientAddress" | "recipientType">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly region: Schema.NullOr<Schema.String>;
        readonly statusTypeId: Schema.String;
        readonly recipientAddress: Schema.NullOr<Schema.String>;
        readonly recipientType: Schema.NullOr<Schema.String>;
    }, "region" | "applicationId" | "statusTypeId" | "recipientAddress" | "recipientType">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly region: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly applicationId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly statusTypeId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly recipientAddress: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly recipientType: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly region: string | null;
            readonly applicationId: string;
            readonly statusTypeId: string;
            readonly recipientAddress: string | null;
            readonly recipientType: string | null;
        } | {
            readonly id: string;
            readonly region: string | null;
            readonly applicationId: string;
            readonly statusTypeId: string;
            readonly recipientAddress: string | null;
            readonly recipientType: string | null;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly region: string | null;
            readonly applicationId: string;
            readonly statusTypeId: string;
            readonly recipientAddress: string | null;
            readonly recipientType: string | null;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly region?: string | null | undefined;
            readonly applicationId?: string | undefined;
            readonly statusTypeId?: string | undefined;
            readonly recipientAddress?: string | null | undefined;
            readonly recipientType?: string | null | undefined;
        } | {
            readonly id: string;
            readonly region?: string | null | undefined;
            readonly applicationId?: string | undefined;
            readonly statusTypeId?: string | undefined;
            readonly recipientAddress?: string | null | undefined;
            readonly recipientType?: string | null | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly applicationId: Schema.String;
        readonly region: Schema.NullOr<Schema.String>;
        readonly statusTypeId: Schema.String;
        readonly recipientAddress: Schema.NullOr<Schema.String>;
        readonly recipientType: Schema.NullOr<Schema.String>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("region" | "applicationId" | "statusTypeId" | "recipientAddress" | "recipientType")[] | undefined;
    };
    ui: Partial<{
        readonly applicationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly region?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly statusTypeId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly recipientAddress?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly recipientType?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const StatusInformationSchema: {
    selectSchema: Schema.Struct<{
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly statusTypeId: Schema.String;
        readonly errorId: Schema.Number;
        readonly instanceId: Schema.Number;
        readonly hostName: Schema.NullOr<Schema.String>;
        readonly summary: Schema.NullOr<Schema.String>;
        readonly description: Schema.NullOr<Schema.String>;
        readonly developerInfo: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly statusTypeId: Schema.String;
        readonly errorId: Schema.Number;
        readonly instanceId: Schema.Number;
        readonly hostName: Schema.NullOr<Schema.String>;
        readonly summary: Schema.NullOr<Schema.String>;
        readonly description: Schema.NullOr<Schema.String>;
        readonly developerInfo: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly statusTypeId: Schema.toEncoded<Schema.String>;
        readonly errorId: Schema.toEncoded<Schema.Number>;
        readonly instanceId: Schema.toEncoded<Schema.Number>;
        readonly hostName: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly summary: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly description: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly developerInfo: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        modifiedAt: Schema.toEncoded<Schema.decodeTo<Schema.String, Schema.Date, never, never>>;
        modifiedBy: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly statusTypeId: Schema.String;
        readonly errorId: Schema.Number;
        readonly instanceId: Schema.Number;
        readonly hostName: Schema.NullOr<Schema.String>;
        readonly summary: Schema.NullOr<Schema.String>;
        readonly description: Schema.NullOr<Schema.String>;
        readonly developerInfo: Schema.NullOr<Schema.String>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly statusTypeId: Schema.String;
        readonly errorId: Schema.Number;
        readonly instanceId: Schema.Number;
        readonly hostName: Schema.NullOr<Schema.String>;
        readonly summary: Schema.NullOr<Schema.String>;
        readonly description: Schema.NullOr<Schema.String>;
        readonly developerInfo: Schema.NullOr<Schema.String>;
    }>, Schema.Struct<{
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly statusTypeId: Schema.toEncoded<Schema.String>;
        readonly errorId: Schema.toEncoded<Schema.Number>;
        readonly instanceId: Schema.toEncoded<Schema.Number>;
        readonly hostName: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly summary: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly description: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly developerInfo: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly statusTypeId: Schema.String;
        readonly errorId: Schema.Number;
        readonly instanceId: Schema.Number;
        readonly hostName: Schema.NullOr<Schema.String>;
        readonly summary: Schema.NullOr<Schema.String>;
        readonly description: Schema.NullOr<Schema.String>;
        readonly developerInfo: Schema.NullOr<Schema.String>;
    }, "summary" | "description" | "applicationId" | "statusTypeId" | "errorId" | "instanceId" | "hostName" | "developerInfo">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly statusTypeId: Schema.String;
        readonly errorId: Schema.Number;
        readonly instanceId: Schema.Number;
        readonly hostName: Schema.NullOr<Schema.String>;
        readonly summary: Schema.NullOr<Schema.String>;
        readonly description: Schema.NullOr<Schema.String>;
        readonly developerInfo: Schema.NullOr<Schema.String>;
    }, "summary" | "description" | "applicationId" | "statusTypeId" | "errorId" | "instanceId" | "hostName" | "developerInfo">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly summary: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly description: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly applicationId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly statusTypeId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly errorId: Schema.toEncoded<Schema.optional<Schema.Number>>;
        readonly instanceId: Schema.toEncoded<Schema.optional<Schema.Number>>;
        readonly hostName: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly developerInfo: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly summary: string | null;
            readonly description: string | null;
            readonly applicationId: string;
            readonly statusTypeId: string;
            readonly errorId: number;
            readonly instanceId: number;
            readonly hostName: string | null;
            readonly developerInfo: string | null;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        } | {
            readonly id: string;
            readonly summary: string | null;
            readonly description: string | null;
            readonly applicationId: string;
            readonly statusTypeId: string;
            readonly errorId: number;
            readonly instanceId: number;
            readonly hostName: string | null;
            readonly developerInfo: string | null;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly summary: string | null;
            readonly description: string | null;
            readonly applicationId: string;
            readonly statusTypeId: string;
            readonly errorId: number;
            readonly instanceId: number;
            readonly hostName: string | null;
            readonly developerInfo: string | null;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly summary?: string | null | undefined;
            readonly description?: string | null | undefined;
            readonly applicationId?: string | undefined;
            readonly statusTypeId?: string | undefined;
            readonly errorId?: number | undefined;
            readonly instanceId?: number | undefined;
            readonly hostName?: string | null | undefined;
            readonly developerInfo?: string | null | undefined;
        } | {
            readonly id: string;
            readonly summary?: string | null | undefined;
            readonly description?: string | null | undefined;
            readonly applicationId?: string | undefined;
            readonly statusTypeId?: string | undefined;
            readonly errorId?: number | undefined;
            readonly instanceId?: number | undefined;
            readonly hostName?: string | null | undefined;
            readonly developerInfo?: string | null | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly applicationId: Schema.String;
        readonly statusTypeId: Schema.String;
        readonly errorId: Schema.Number;
        readonly instanceId: Schema.Number;
        readonly hostName: Schema.NullOr<Schema.String>;
        readonly summary: Schema.NullOr<Schema.String>;
        readonly description: Schema.NullOr<Schema.String>;
        readonly developerInfo: Schema.NullOr<Schema.String>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("summary" | "description" | "applicationId" | "statusTypeId" | "errorId" | "instanceId" | "hostName" | "developerInfo")[] | undefined;
    };
    ui: Partial<{
        readonly applicationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly statusTypeId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly errorId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly instanceId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly hostName?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly summary?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly description?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly developerInfo?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const MarketHolidaySchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly market: Schema.Literals<string[]>;
        readonly year: Schema.Number;
        readonly holiday: Schema.brand<Schema.String, "LocalDate">;
    }) | ({
        id: Schema.String;
    } & {
        readonly market: Schema.Literals<string[]>;
        readonly year: Schema.Number;
        readonly holiday: Schema.brand<Schema.String, "LocalDate">;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly market: Schema.Literals<string[]>;
        readonly year: Schema.Number;
        readonly holiday: Schema.brand<Schema.String, "LocalDate">;
    }) | ({
        id: Schema.String;
    } & {
        readonly market: Schema.Literals<string[]>;
        readonly year: Schema.Number;
        readonly holiday: Schema.brand<Schema.String, "LocalDate">;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly market: Schema.toEncoded<Schema.Literals<string[]>>;
        readonly year: Schema.toEncoded<Schema.Number>;
        readonly holiday: Schema.toEncoded<Schema.brand<Schema.String, "LocalDate">>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly market: Schema.Literals<string[]>;
        readonly year: Schema.Number;
        readonly holiday: Schema.brand<Schema.String, "LocalDate">;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly market: Schema.Literals<string[]>;
        readonly year: Schema.Number;
        readonly holiday: Schema.brand<Schema.String, "LocalDate">;
    }>, Schema.Struct<{
        readonly market: Schema.toEncoded<Schema.Literals<string[]>>;
        readonly year: Schema.toEncoded<Schema.Number>;
        readonly holiday: Schema.toEncoded<Schema.brand<Schema.String, "LocalDate">>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly market: Schema.Literals<string[]>;
        readonly year: Schema.Number;
        readonly holiday: Schema.brand<Schema.String, "LocalDate">;
    }, "market" | "year" | "holiday">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly market: Schema.Literals<string[]>;
        readonly year: Schema.Number;
        readonly holiday: Schema.brand<Schema.String, "LocalDate">;
    }, "market" | "year" | "holiday">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly market: Schema.toEncoded<Schema.optional<Schema.Literals<string[]>>>;
        readonly year: Schema.toEncoded<Schema.optional<Schema.Number>>;
        readonly holiday: Schema.toEncoded<Schema.optional<Schema.brand<Schema.String, "LocalDate">>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly market: string;
            readonly year: number;
            readonly holiday: string & import("effect/Brand").Brand<"LocalDate">;
        } | {
            readonly id: string;
            readonly market: string;
            readonly year: number;
            readonly holiday: string & import("effect/Brand").Brand<"LocalDate">;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly market: string;
            readonly year: number;
            readonly holiday: string & import("effect/Brand").Brand<"LocalDate">;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly market?: string | undefined;
            readonly year?: number | undefined;
            readonly holiday?: (string & import("effect/Brand").Brand<"LocalDate">) | undefined;
        } | {
            readonly id: string;
            readonly market?: string | undefined;
            readonly year?: number | undefined;
            readonly holiday?: (string & import("effect/Brand").Brand<"LocalDate">) | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly market: Schema.Literals<string[]>;
        readonly year: Schema.Number;
        readonly holiday: Schema.brand<Schema.String, "LocalDate">;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("market" | "year" | "holiday")[] | undefined;
    };
    ui: Partial<{
        readonly market?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly year?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly holiday?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const MilestoneSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly milestoneId: Schema.String;
        readonly description: Schema.String;
    }) | ({
        id: Schema.String;
    } & {
        readonly milestoneId: Schema.String;
        readonly description: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly milestoneId: Schema.String;
        readonly description: Schema.String;
    }) | ({
        id: Schema.String;
    } & {
        readonly milestoneId: Schema.String;
        readonly description: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly milestoneId: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly milestoneId: Schema.String;
        readonly description: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly milestoneId: Schema.String;
        readonly description: Schema.String;
    }>, Schema.Struct<{
        readonly milestoneId: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly milestoneId: Schema.String;
        readonly description: Schema.String;
    }, "description" | "milestoneId">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly milestoneId: Schema.String;
        readonly description: Schema.String;
    }, "description" | "milestoneId">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly milestoneId: Schema.toEncoded<Schema.optional<Schema.String>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly description: string;
            readonly milestoneId: string;
        } | {
            readonly id: string;
            readonly description: string;
            readonly milestoneId: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly description: string;
            readonly milestoneId: string;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly description?: string | undefined;
            readonly milestoneId?: string | undefined;
        } | {
            readonly id: string;
            readonly description?: string | undefined;
            readonly milestoneId?: string | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly milestoneId: Schema.String;
        readonly description: Schema.String;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("description" | "milestoneId")[] | undefined;
    };
    ui: Partial<{
        readonly milestoneId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly description?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const MilestoneDailySchema: {
    selectSchema: Schema.Struct<{
        id: Schema.String;
    } & {
        readonly targetType: Schema.String;
        readonly targetDate: Schema.brand<Schema.String, "LocalDate">;
        readonly targetYm: Schema.String;
        readonly milestoneId: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & {
        readonly targetType: Schema.String;
        readonly targetDate: Schema.brand<Schema.String, "LocalDate">;
        readonly targetYm: Schema.String;
        readonly milestoneId: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly targetType: Schema.toEncoded<Schema.String>;
        readonly targetDate: Schema.toEncoded<Schema.brand<Schema.String, "LocalDate">>;
        readonly targetYm: Schema.toEncoded<Schema.String>;
        readonly milestoneId: Schema.toEncoded<Schema.String>;
        modifiedAt: Schema.toEncoded<Schema.decodeTo<Schema.String, Schema.Date, never, never>>;
        modifiedBy: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly targetType: Schema.String;
        readonly targetDate: Schema.brand<Schema.String, "LocalDate">;
        readonly targetYm: Schema.String;
        readonly milestoneId: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly targetType: Schema.String;
        readonly targetDate: Schema.brand<Schema.String, "LocalDate">;
        readonly targetYm: Schema.String;
        readonly milestoneId: Schema.String;
    }>, Schema.Struct<{
        readonly targetType: Schema.toEncoded<Schema.String>;
        readonly targetDate: Schema.toEncoded<Schema.brand<Schema.String, "LocalDate">>;
        readonly targetYm: Schema.toEncoded<Schema.String>;
        readonly milestoneId: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly targetType: Schema.String;
        readonly targetDate: Schema.brand<Schema.String, "LocalDate">;
        readonly targetYm: Schema.String;
        readonly milestoneId: Schema.String;
    }, "milestoneId" | "targetType" | "targetDate" | "targetYm">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly targetType: Schema.String;
        readonly targetDate: Schema.brand<Schema.String, "LocalDate">;
        readonly targetYm: Schema.String;
        readonly milestoneId: Schema.String;
    }, "milestoneId" | "targetType" | "targetDate" | "targetYm">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly milestoneId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly targetType: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly targetDate: Schema.toEncoded<Schema.optional<Schema.brand<Schema.String, "LocalDate">>>;
        readonly targetYm: Schema.toEncoded<Schema.optional<Schema.String>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly milestoneId: string;
            readonly targetType: string;
            readonly targetDate: string & import("effect/Brand").Brand<"LocalDate">;
            readonly targetYm: string;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        } | {
            readonly id: string;
            readonly milestoneId: string;
            readonly targetType: string;
            readonly targetDate: string & import("effect/Brand").Brand<"LocalDate">;
            readonly targetYm: string;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly milestoneId: string;
            readonly targetType: string;
            readonly targetDate: string & import("effect/Brand").Brand<"LocalDate">;
            readonly targetYm: string;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly milestoneId?: string | undefined;
            readonly targetType?: string | undefined;
            readonly targetDate?: (string & import("effect/Brand").Brand<"LocalDate">) | undefined;
            readonly targetYm?: string | undefined;
        } | {
            readonly id: string;
            readonly milestoneId?: string | undefined;
            readonly targetType?: string | undefined;
            readonly targetDate?: (string & import("effect/Brand").Brand<"LocalDate">) | undefined;
            readonly targetYm?: string | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly targetType: Schema.String;
        readonly targetDate: Schema.brand<Schema.String, "LocalDate">;
        readonly targetYm: Schema.String;
        readonly milestoneId: Schema.String;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("milestoneId" | "targetType" | "targetDate" | "targetYm")[] | undefined;
    };
    ui: Partial<{
        readonly targetType?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly targetDate?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly targetYm?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly milestoneId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const VariableParameterSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly variableKey: Schema.String;
        readonly description: Schema.String;
    }) | ({
        id: Schema.String;
    } & {
        readonly variableKey: Schema.String;
        readonly description: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly variableKey: Schema.String;
        readonly description: Schema.String;
    }) | ({
        id: Schema.String;
    } & {
        readonly variableKey: Schema.String;
        readonly description: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly variableKey: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly variableKey: Schema.String;
        readonly description: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly variableKey: Schema.String;
        readonly description: Schema.String;
    }>, Schema.Struct<{
        readonly variableKey: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly variableKey: Schema.String;
        readonly description: Schema.String;
    }, "description" | "variableKey">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly variableKey: Schema.String;
        readonly description: Schema.String;
    }, "description" | "variableKey">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly variableKey: Schema.toEncoded<Schema.optional<Schema.String>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly description: string;
            readonly variableKey: string;
        } | {
            readonly id: string;
            readonly description: string;
            readonly variableKey: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly description: string;
            readonly variableKey: string;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly description?: string | undefined;
            readonly variableKey?: string | undefined;
        } | {
            readonly id: string;
            readonly description?: string | undefined;
            readonly variableKey?: string | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly variableKey: Schema.String;
        readonly description: Schema.String;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("description" | "variableKey")[] | undefined;
    };
    ui: Partial<{
        readonly variableKey?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly description?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const ParameterMasterSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly itemKey: Schema.String;
        readonly itemValue: Schema.String;
        readonly itemFromDate: Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>;
    }) | ({
        id: Schema.String;
    } & {
        readonly itemKey: Schema.String;
        readonly itemValue: Schema.String;
        readonly itemFromDate: Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly itemKey: Schema.String;
        readonly itemValue: Schema.String;
        readonly itemFromDate: Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>;
    }) | ({
        id: Schema.String;
    } & {
        readonly itemKey: Schema.String;
        readonly itemValue: Schema.String;
        readonly itemFromDate: Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly itemKey: Schema.toEncoded<Schema.String>;
        readonly itemValue: Schema.toEncoded<Schema.String>;
        readonly itemFromDate: Schema.toEncoded<Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly itemKey: Schema.String;
        readonly itemValue: Schema.String;
        readonly itemFromDate: Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly itemKey: Schema.String;
        readonly itemValue: Schema.String;
        readonly itemFromDate: Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>;
    }>, Schema.Struct<{
        readonly itemKey: Schema.toEncoded<Schema.String>;
        readonly itemValue: Schema.toEncoded<Schema.String>;
        readonly itemFromDate: Schema.toEncoded<Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly itemKey: Schema.String;
        readonly itemValue: Schema.String;
        readonly itemFromDate: Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>;
    }, "itemKey" | "itemValue" | "itemFromDate">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly itemKey: Schema.String;
        readonly itemValue: Schema.String;
        readonly itemFromDate: Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>;
    }, "itemKey" | "itemValue" | "itemFromDate">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly itemKey: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly itemValue: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly itemFromDate: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly itemKey: string;
            readonly itemValue: string;
            readonly itemFromDate: (string & import("effect/Brand").Brand<"LocalDate">) | null;
        } | {
            readonly id: string;
            readonly itemKey: string;
            readonly itemValue: string;
            readonly itemFromDate: (string & import("effect/Brand").Brand<"LocalDate">) | null;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly itemKey: string;
            readonly itemValue: string;
            readonly itemFromDate: (string & import("effect/Brand").Brand<"LocalDate">) | null;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly itemKey?: string | undefined;
            readonly itemValue?: string | undefined;
            readonly itemFromDate?: (string & import("effect/Brand").Brand<"LocalDate">) | null | undefined;
        } | {
            readonly id: string;
            readonly itemKey?: string | undefined;
            readonly itemValue?: string | undefined;
            readonly itemFromDate?: (string & import("effect/Brand").Brand<"LocalDate">) | null | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly itemKey: Schema.String;
        readonly itemValue: Schema.String;
        readonly itemFromDate: Schema.NullOr<Schema.brand<Schema.String, "LocalDate">>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("itemKey" | "itemValue" | "itemFromDate")[] | undefined;
    };
    ui: Partial<{
        readonly itemKey?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly itemValue?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly itemFromDate?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const TaskInfoSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly description: Schema.String;
        readonly language: Schema.String;
        readonly location: Schema.String;
        readonly className: Schema.String;
        readonly restartable: Schema.Boolean;
    }) | ({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly description: Schema.String;
        readonly language: Schema.String;
        readonly location: Schema.String;
        readonly className: Schema.String;
        readonly restartable: Schema.Boolean;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly description: Schema.String;
        readonly language: Schema.String;
        readonly location: Schema.String;
        readonly className: Schema.String;
        readonly restartable: Schema.Boolean;
    }) | ({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly description: Schema.String;
        readonly language: Schema.String;
        readonly location: Schema.String;
        readonly className: Schema.String;
        readonly restartable: Schema.Boolean;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
        readonly language: Schema.toEncoded<Schema.String>;
        readonly location: Schema.toEncoded<Schema.String>;
        readonly className: Schema.toEncoded<Schema.String>;
        readonly restartable: Schema.toEncoded<Schema.Boolean>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly description: Schema.String;
        readonly language: Schema.String;
        readonly location: Schema.String;
        readonly className: Schema.String;
        readonly restartable: Schema.Boolean;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly description: Schema.String;
        readonly language: Schema.String;
        readonly location: Schema.String;
        readonly className: Schema.String;
        readonly restartable: Schema.Boolean;
    }>, Schema.Struct<{
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
        readonly language: Schema.toEncoded<Schema.String>;
        readonly location: Schema.toEncoded<Schema.String>;
        readonly className: Schema.toEncoded<Schema.String>;
        readonly restartable: Schema.toEncoded<Schema.Boolean>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly description: Schema.String;
        readonly language: Schema.String;
        readonly location: Schema.String;
        readonly className: Schema.String;
        readonly restartable: Schema.Boolean;
    }, "className" | "location" | "description" | "applicationId" | "language" | "restartable">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly description: Schema.String;
        readonly language: Schema.String;
        readonly location: Schema.String;
        readonly className: Schema.String;
        readonly restartable: Schema.Boolean;
    }, "className" | "location" | "description" | "applicationId" | "language" | "restartable">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly className: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly location: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly description: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly applicationId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly language: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly restartable: Schema.toEncoded<Schema.optional<Schema.Boolean>>;
    }>, never, never>;
    types: {
        _select: {
            readonly className: string;
            readonly id: string;
            readonly location: string;
            readonly description: string;
            readonly applicationId: string;
            readonly language: string;
            readonly restartable: boolean;
        } | {
            readonly className: string;
            readonly id: string;
            readonly location: string;
            readonly description: string;
            readonly applicationId: string;
            readonly language: string;
            readonly restartable: boolean;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly className: string;
            readonly location: string;
            readonly description: string;
            readonly applicationId: string;
            readonly language: string;
            readonly restartable: boolean;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly className?: string | undefined;
            readonly location?: string | undefined;
            readonly description?: string | undefined;
            readonly applicationId?: string | undefined;
            readonly language?: string | undefined;
            readonly restartable?: boolean | undefined;
        } | {
            readonly id: string;
            readonly className?: string | undefined;
            readonly location?: string | undefined;
            readonly description?: string | undefined;
            readonly applicationId?: string | undefined;
            readonly language?: string | undefined;
            readonly restartable?: boolean | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly applicationId: Schema.String;
        readonly description: Schema.String;
        readonly language: Schema.String;
        readonly location: Schema.String;
        readonly className: Schema.String;
        readonly restartable: Schema.Boolean;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("className" | "location" | "description" | "applicationId" | "language" | "restartable")[] | undefined;
    };
    ui: Partial<{
        readonly applicationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly description?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly language?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly location?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly className?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly restartable?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const TaskInfoAccessListSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly accountName: Schema.String;
        readonly canAccess: Schema.Boolean;
        readonly forbidden: Schema.Boolean;
    }) | ({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly accountName: Schema.String;
        readonly canAccess: Schema.Boolean;
        readonly forbidden: Schema.Boolean;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly accountName: Schema.String;
        readonly canAccess: Schema.Boolean;
        readonly forbidden: Schema.Boolean;
    }) | ({
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly accountName: Schema.String;
        readonly canAccess: Schema.Boolean;
        readonly forbidden: Schema.Boolean;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly taskInformationId: Schema.toEncoded<Schema.String>;
        readonly accountName: Schema.toEncoded<Schema.String>;
        readonly canAccess: Schema.toEncoded<Schema.Boolean>;
        readonly forbidden: Schema.toEncoded<Schema.Boolean>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly accountName: Schema.String;
        readonly canAccess: Schema.Boolean;
        readonly forbidden: Schema.Boolean;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly accountName: Schema.String;
        readonly canAccess: Schema.Boolean;
        readonly forbidden: Schema.Boolean;
    }>, Schema.Struct<{
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly taskInformationId: Schema.toEncoded<Schema.String>;
        readonly accountName: Schema.toEncoded<Schema.String>;
        readonly canAccess: Schema.toEncoded<Schema.Boolean>;
        readonly forbidden: Schema.toEncoded<Schema.Boolean>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly accountName: Schema.String;
        readonly canAccess: Schema.Boolean;
        readonly forbidden: Schema.Boolean;
    }, "applicationId" | "taskInformationId" | "accountName" | "canAccess" | "forbidden">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly accountName: Schema.String;
        readonly canAccess: Schema.Boolean;
        readonly forbidden: Schema.Boolean;
    }, "applicationId" | "taskInformationId" | "accountName" | "canAccess" | "forbidden">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly applicationId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly taskInformationId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly accountName: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly canAccess: Schema.toEncoded<Schema.optional<Schema.Boolean>>;
        readonly forbidden: Schema.toEncoded<Schema.optional<Schema.Boolean>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly applicationId: string;
            readonly taskInformationId: string;
            readonly accountName: string;
            readonly canAccess: boolean;
            readonly forbidden: boolean;
        } | {
            readonly id: string;
            readonly applicationId: string;
            readonly taskInformationId: string;
            readonly accountName: string;
            readonly canAccess: boolean;
            readonly forbidden: boolean;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly applicationId: string;
            readonly taskInformationId: string;
            readonly accountName: string;
            readonly canAccess: boolean;
            readonly forbidden: boolean;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly applicationId?: string | undefined;
            readonly taskInformationId?: string | undefined;
            readonly accountName?: string | undefined;
            readonly canAccess?: boolean | undefined;
            readonly forbidden?: boolean | undefined;
        } | {
            readonly id: string;
            readonly applicationId?: string | undefined;
            readonly taskInformationId?: string | undefined;
            readonly accountName?: string | undefined;
            readonly canAccess?: boolean | undefined;
            readonly forbidden?: boolean | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly accountName: Schema.String;
        readonly canAccess: Schema.Boolean;
        readonly forbidden: Schema.Boolean;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("applicationId" | "taskInformationId" | "accountName" | "canAccess" | "forbidden")[] | undefined;
    };
    ui: Partial<{
        readonly applicationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly taskInformationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly accountName?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly canAccess?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly forbidden?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const TaskDataSchema: {
    selectSchema: Schema.Struct<{
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly parentTaskDataId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & {
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly parentTaskDataId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly taskInformationId: Schema.toEncoded<Schema.String>;
        readonly parentTaskDataId: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly parameter: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        modifiedAt: Schema.toEncoded<Schema.decodeTo<Schema.String, Schema.Date, never, never>>;
        modifiedBy: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly parentTaskDataId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly parentTaskDataId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
    }>, Schema.Struct<{
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly taskInformationId: Schema.toEncoded<Schema.String>;
        readonly parentTaskDataId: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly parameter: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly parentTaskDataId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
    }, "applicationId" | "taskInformationId" | "parentTaskDataId" | "parameter">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly parentTaskDataId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
    }, "applicationId" | "taskInformationId" | "parentTaskDataId" | "parameter">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly applicationId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly taskInformationId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly parentTaskDataId: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly parameter: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly applicationId: string;
            readonly taskInformationId: string;
            readonly parentTaskDataId: string | null;
            readonly parameter: string | null;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        } | {
            readonly id: string;
            readonly applicationId: string;
            readonly taskInformationId: string;
            readonly parentTaskDataId: string | null;
            readonly parameter: string | null;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly applicationId: string;
            readonly taskInformationId: string;
            readonly parentTaskDataId: string | null;
            readonly parameter: string | null;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly applicationId?: string | undefined;
            readonly taskInformationId?: string | undefined;
            readonly parentTaskDataId?: string | null | undefined;
            readonly parameter?: string | null | undefined;
        } | {
            readonly id: string;
            readonly applicationId?: string | undefined;
            readonly taskInformationId?: string | undefined;
            readonly parentTaskDataId?: string | null | undefined;
            readonly parameter?: string | null | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly parentTaskDataId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("applicationId" | "taskInformationId" | "parentTaskDataId" | "parameter")[] | undefined;
    };
    ui: Partial<{
        readonly applicationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly taskInformationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly parentTaskDataId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly parameter?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const TaskInstanceSchema: {
    selectSchema: Schema.Struct<{
        id: Schema.String;
    } & {
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly isDone: Schema.Boolean;
        readonly statusInformationId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
        readonly comment: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & {
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly isDone: Schema.Boolean;
        readonly statusInformationId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
        readonly comment: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly taskDataId: Schema.toEncoded<Schema.String>;
        readonly taskStatus: Schema.toEncoded<Schema.String>;
        readonly isDone: Schema.toEncoded<Schema.Boolean>;
        readonly statusInformationId: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly parameter: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly comment: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        modifiedAt: Schema.toEncoded<Schema.decodeTo<Schema.String, Schema.Date, never, never>>;
        modifiedBy: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly isDone: Schema.Boolean;
        readonly statusInformationId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
        readonly comment: Schema.NullOr<Schema.String>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly isDone: Schema.Boolean;
        readonly statusInformationId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
        readonly comment: Schema.NullOr<Schema.String>;
    }>, Schema.Struct<{
        readonly taskDataId: Schema.toEncoded<Schema.String>;
        readonly taskStatus: Schema.toEncoded<Schema.String>;
        readonly isDone: Schema.toEncoded<Schema.Boolean>;
        readonly statusInformationId: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly parameter: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly comment: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly isDone: Schema.Boolean;
        readonly statusInformationId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
        readonly comment: Schema.NullOr<Schema.String>;
    }, "parameter" | "taskDataId" | "taskStatus" | "isDone" | "statusInformationId" | "comment">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly isDone: Schema.Boolean;
        readonly statusInformationId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
        readonly comment: Schema.NullOr<Schema.String>;
    }, "parameter" | "taskDataId" | "taskStatus" | "isDone" | "statusInformationId" | "comment">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly parameter: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly taskDataId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly taskStatus: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly isDone: Schema.toEncoded<Schema.optional<Schema.Boolean>>;
        readonly statusInformationId: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly comment: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly parameter: string | null;
            readonly taskDataId: string;
            readonly taskStatus: string;
            readonly isDone: boolean;
            readonly statusInformationId: string | null;
            readonly comment: string | null;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        } | {
            readonly id: string;
            readonly parameter: string | null;
            readonly taskDataId: string;
            readonly taskStatus: string;
            readonly isDone: boolean;
            readonly statusInformationId: string | null;
            readonly comment: string | null;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly parameter: string | null;
            readonly taskDataId: string;
            readonly taskStatus: string;
            readonly isDone: boolean;
            readonly statusInformationId: string | null;
            readonly comment: string | null;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly parameter?: string | null | undefined;
            readonly taskDataId?: string | undefined;
            readonly taskStatus?: string | undefined;
            readonly isDone?: boolean | undefined;
            readonly statusInformationId?: string | null | undefined;
            readonly comment?: string | null | undefined;
        } | {
            readonly id: string;
            readonly parameter?: string | null | undefined;
            readonly taskDataId?: string | undefined;
            readonly taskStatus?: string | undefined;
            readonly isDone?: boolean | undefined;
            readonly statusInformationId?: string | null | undefined;
            readonly comment?: string | null | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly isDone: Schema.Boolean;
        readonly statusInformationId: Schema.NullOr<Schema.String>;
        readonly parameter: Schema.NullOr<Schema.String>;
        readonly comment: Schema.NullOr<Schema.String>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("parameter" | "taskDataId" | "taskStatus" | "isDone" | "statusInformationId" | "comment")[] | undefined;
    };
    ui: Partial<{
        readonly taskDataId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly taskStatus?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly isDone?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly statusInformationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly parameter?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly comment?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const TaskInstanceSubmitInformationSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly taskInstanceId: Schema.String;
        readonly submitTo: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly taskInstanceId: Schema.String;
        readonly submitTo: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly taskInstanceId: Schema.String;
        readonly submitTo: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly taskInstanceId: Schema.String;
        readonly submitTo: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly taskInstanceId: Schema.toEncoded<Schema.String>;
        readonly submitTo: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly taskInstanceId: Schema.String;
        readonly submitTo: Schema.NullOr<Schema.String>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly taskInstanceId: Schema.String;
        readonly submitTo: Schema.NullOr<Schema.String>;
    }>, Schema.Struct<{
        readonly taskInstanceId: Schema.toEncoded<Schema.String>;
        readonly submitTo: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly taskInstanceId: Schema.String;
        readonly submitTo: Schema.NullOr<Schema.String>;
    }, "taskInstanceId" | "submitTo">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly taskInstanceId: Schema.String;
        readonly submitTo: Schema.NullOr<Schema.String>;
    }, "taskInstanceId" | "submitTo">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly taskInstanceId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly submitTo: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly taskInstanceId: string;
            readonly submitTo: string | null;
        } | {
            readonly id: string;
            readonly taskInstanceId: string;
            readonly submitTo: string | null;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly taskInstanceId: string;
            readonly submitTo: string | null;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly taskInstanceId?: string | undefined;
            readonly submitTo?: string | null | undefined;
        } | {
            readonly id: string;
            readonly taskInstanceId?: string | undefined;
            readonly submitTo?: string | null | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly taskInstanceId: Schema.String;
        readonly submitTo: Schema.NullOr<Schema.String>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("taskInstanceId" | "submitTo")[] | undefined;
    };
    ui: Partial<{
        readonly taskInstanceId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly submitTo?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const TaskDataStatus: {
    selectSchema: Schema.Struct<{
        id: Schema.String;
    } & {
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly latestTaskInstanceId: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & {
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly latestTaskInstanceId: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly taskDataId: Schema.toEncoded<Schema.String>;
        readonly taskStatus: Schema.toEncoded<Schema.String>;
        readonly latestTaskInstanceId: Schema.toEncoded<Schema.String>;
        modifiedAt: Schema.toEncoded<Schema.decodeTo<Schema.String, Schema.Date, never, never>>;
        modifiedBy: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly latestTaskInstanceId: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly latestTaskInstanceId: Schema.String;
    }>, Schema.Struct<{
        readonly taskDataId: Schema.toEncoded<Schema.String>;
        readonly taskStatus: Schema.toEncoded<Schema.String>;
        readonly latestTaskInstanceId: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly latestTaskInstanceId: Schema.String;
    }, "taskDataId" | "taskStatus" | "latestTaskInstanceId">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly latestTaskInstanceId: Schema.String;
    }, "taskDataId" | "taskStatus" | "latestTaskInstanceId">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly taskDataId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly taskStatus: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly latestTaskInstanceId: Schema.toEncoded<Schema.optional<Schema.String>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly taskDataId: string;
            readonly taskStatus: string;
            readonly latestTaskInstanceId: string;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        } | {
            readonly id: string;
            readonly taskDataId: string;
            readonly taskStatus: string;
            readonly latestTaskInstanceId: string;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly taskDataId: string;
            readonly taskStatus: string;
            readonly latestTaskInstanceId: string;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly taskDataId?: string | undefined;
            readonly taskStatus?: string | undefined;
            readonly latestTaskInstanceId?: string | undefined;
        } | {
            readonly id: string;
            readonly taskDataId?: string | undefined;
            readonly taskStatus?: string | undefined;
            readonly latestTaskInstanceId?: string | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly taskDataId: Schema.String;
        readonly taskStatus: Schema.String;
        readonly latestTaskInstanceId: Schema.String;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("taskDataId" | "taskStatus" | "latestTaskInstanceId")[] | undefined;
    };
    ui: Partial<{
        readonly taskDataId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly taskStatus?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly latestTaskInstanceId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const TaskDataLogSchema: {
    selectSchema: Schema.Struct<{
        id: Schema.String;
    } & {
        readonly taskDataId: Schema.String;
        readonly log: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & {
        readonly taskDataId: Schema.String;
        readonly log: Schema.String;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    }>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly taskDataId: Schema.toEncoded<Schema.String>;
        readonly log: Schema.toEncoded<Schema.String>;
        modifiedAt: Schema.toEncoded<Schema.decodeTo<Schema.String, Schema.Date, never, never>>;
        modifiedBy: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly taskDataId: Schema.String;
        readonly log: Schema.String;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly taskDataId: Schema.String;
        readonly log: Schema.String;
    }>, Schema.Struct<{
        readonly taskDataId: Schema.toEncoded<Schema.String>;
        readonly log: Schema.toEncoded<Schema.String>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly taskDataId: Schema.String;
        readonly log: Schema.String;
    }, "log" | "taskDataId">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly taskDataId: Schema.String;
        readonly log: Schema.String;
    }, "log" | "taskDataId">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly log: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly taskDataId: Schema.toEncoded<Schema.optional<Schema.String>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly log: string;
            readonly taskDataId: string;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        } | {
            readonly id: string;
            readonly log: string;
            readonly taskDataId: string;
            readonly modifiedAt: string;
            readonly modifiedBy: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly log: string;
            readonly taskDataId: string;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly log?: string | undefined;
            readonly taskDataId?: string | undefined;
        } | {
            readonly id: string;
            readonly log?: string | undefined;
            readonly taskDataId?: string | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly taskDataId: Schema.String;
        readonly log: Schema.String;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("log" | "taskDataId")[] | undefined;
    };
    ui: Partial<{
        readonly taskDataId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly log?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const ServiceTypeSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly assemblyName: Schema.NullOr<Schema.String>;
        readonly className: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly assemblyName: Schema.NullOr<Schema.String>;
        readonly className: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly assemblyName: Schema.NullOr<Schema.String>;
        readonly className: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly assemblyName: Schema.NullOr<Schema.String>;
        readonly className: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
        readonly assemblyName: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly className: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly description: Schema.String;
        readonly assemblyName: Schema.NullOr<Schema.String>;
        readonly className: Schema.NullOr<Schema.String>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly description: Schema.String;
        readonly assemblyName: Schema.NullOr<Schema.String>;
        readonly className: Schema.NullOr<Schema.String>;
    }>, Schema.Struct<{
        readonly description: Schema.toEncoded<Schema.String>;
        readonly assemblyName: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly className: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly description: Schema.String;
        readonly assemblyName: Schema.NullOr<Schema.String>;
        readonly className: Schema.NullOr<Schema.String>;
    }, "className" | "description" | "assemblyName">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly description: Schema.String;
        readonly assemblyName: Schema.NullOr<Schema.String>;
        readonly className: Schema.NullOr<Schema.String>;
    }, "className" | "description" | "assemblyName">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly className: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly description: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly assemblyName: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
    }>, never, never>;
    types: {
        _select: {
            readonly className: string | null;
            readonly id: string;
            readonly description: string;
            readonly assemblyName: string | null;
        } | {
            readonly className: string | null;
            readonly id: string;
            readonly description: string;
            readonly assemblyName: string | null;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly className: string | null;
            readonly description: string;
            readonly assemblyName: string | null;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly className?: string | null | undefined;
            readonly description?: string | undefined;
            readonly assemblyName?: string | null | undefined;
        } | {
            readonly id: string;
            readonly className?: string | null | undefined;
            readonly description?: string | undefined;
            readonly assemblyName?: string | null | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly description: Schema.String;
        readonly assemblyName: Schema.NullOr<Schema.String>;
        readonly className: Schema.NullOr<Schema.String>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("className" | "description" | "assemblyName")[] | undefined;
    };
    ui: Partial<{
        readonly description?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly assemblyName?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly className?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const ServiceSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly serviceTypeId: Schema.String;
        readonly parameter: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly serviceTypeId: Schema.String;
        readonly parameter: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly serviceTypeId: Schema.String;
        readonly parameter: Schema.NullOr<Schema.String>;
    }) | ({
        id: Schema.String;
    } & {
        readonly description: Schema.String;
        readonly serviceTypeId: Schema.String;
        readonly parameter: Schema.NullOr<Schema.String>;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
        readonly serviceTypeId: Schema.toEncoded<Schema.String>;
        readonly parameter: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly description: Schema.String;
        readonly serviceTypeId: Schema.String;
        readonly parameter: Schema.NullOr<Schema.String>;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly description: Schema.String;
        readonly serviceTypeId: Schema.String;
        readonly parameter: Schema.NullOr<Schema.String>;
    }>, Schema.Struct<{
        readonly description: Schema.toEncoded<Schema.String>;
        readonly serviceTypeId: Schema.toEncoded<Schema.String>;
        readonly parameter: Schema.toEncoded<Schema.NullOr<Schema.String>>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly description: Schema.String;
        readonly serviceTypeId: Schema.String;
        readonly parameter: Schema.NullOr<Schema.String>;
    }, "description" | "parameter" | "serviceTypeId">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly description: Schema.String;
        readonly serviceTypeId: Schema.String;
        readonly parameter: Schema.NullOr<Schema.String>;
    }, "description" | "parameter" | "serviceTypeId">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly parameter: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly serviceTypeId: Schema.toEncoded<Schema.optional<Schema.String>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly description: string;
            readonly parameter: string | null;
            readonly serviceTypeId: string;
        } | {
            readonly id: string;
            readonly description: string;
            readonly parameter: string | null;
            readonly serviceTypeId: string;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly description: string;
            readonly parameter: string | null;
            readonly serviceTypeId: string;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly description?: string | undefined;
            readonly parameter?: string | null | undefined;
            readonly serviceTypeId?: string | undefined;
        } | {
            readonly id: string;
            readonly description?: string | undefined;
            readonly parameter?: string | null | undefined;
            readonly serviceTypeId?: string | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly description: Schema.String;
        readonly serviceTypeId: Schema.String;
        readonly parameter: Schema.NullOr<Schema.String>;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("description" | "parameter" | "serviceTypeId")[] | undefined;
    };
    ui: Partial<{
        readonly description?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly serviceTypeId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly parameter?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
export declare const TaskSchedulerConfigSchema: {
    selectSchema: Schema.Struct<({
        id: Schema.String;
    } & {
        readonly serviceId: Schema.String;
        readonly description: Schema.String;
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly monitorParameter: Schema.String;
        readonly nextTriggerTime: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        readonly taskParameter: Schema.NullOr<Schema.String>;
        readonly isEnabled: Schema.Boolean;
    }) | ({
        id: Schema.String;
    } & {
        readonly serviceId: Schema.String;
        readonly description: Schema.String;
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly monitorParameter: Schema.String;
        readonly nextTriggerTime: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        readonly taskParameter: Schema.NullOr<Schema.String>;
        readonly isEnabled: Schema.Boolean;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })> | Schema.decodeTo<Schema.Struct<({
        id: Schema.String;
    } & {
        readonly serviceId: Schema.String;
        readonly description: Schema.String;
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly monitorParameter: Schema.String;
        readonly nextTriggerTime: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        readonly taskParameter: Schema.NullOr<Schema.String>;
        readonly isEnabled: Schema.Boolean;
    }) | ({
        id: Schema.String;
    } & {
        readonly serviceId: Schema.String;
        readonly description: Schema.String;
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly monitorParameter: Schema.String;
        readonly nextTriggerTime: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        readonly taskParameter: Schema.NullOr<Schema.String>;
        readonly isEnabled: Schema.Boolean;
    } & {
        modifiedAt: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        modifiedBy: Schema.String;
    })>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly serviceId: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly taskInformationId: Schema.toEncoded<Schema.String>;
        readonly monitorParameter: Schema.toEncoded<Schema.String>;
        readonly nextTriggerTime: Schema.toEncoded<Schema.decodeTo<Schema.String, Schema.Date, never, never>>;
        readonly taskParameter: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly isEnabled: Schema.toEncoded<Schema.Boolean>;
    }>, never, never>;
    insertSchema: Schema.Struct<{
        readonly serviceId: Schema.String;
        readonly description: Schema.String;
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly monitorParameter: Schema.String;
        readonly nextTriggerTime: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        readonly taskParameter: Schema.NullOr<Schema.String>;
        readonly isEnabled: Schema.Boolean;
    }> | Schema.decodeTo<Schema.Struct<{
        readonly serviceId: Schema.String;
        readonly description: Schema.String;
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly monitorParameter: Schema.String;
        readonly nextTriggerTime: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        readonly taskParameter: Schema.NullOr<Schema.String>;
        readonly isEnabled: Schema.Boolean;
    }>, Schema.Struct<{
        readonly serviceId: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.String>;
        readonly applicationId: Schema.toEncoded<Schema.String>;
        readonly taskInformationId: Schema.toEncoded<Schema.String>;
        readonly monitorParameter: Schema.toEncoded<Schema.String>;
        readonly nextTriggerTime: Schema.toEncoded<Schema.decodeTo<Schema.String, Schema.Date, never, never>>;
        readonly taskParameter: Schema.toEncoded<Schema.NullOr<Schema.String>>;
        readonly isEnabled: Schema.toEncoded<Schema.Boolean>;
    }>, never, never>;
    updateSchema: Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly serviceId: Schema.String;
        readonly description: Schema.String;
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly monitorParameter: Schema.String;
        readonly nextTriggerTime: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        readonly taskParameter: Schema.NullOr<Schema.String>;
        readonly isEnabled: Schema.Boolean;
    }, "description" | "applicationId" | "taskInformationId" | "serviceId" | "monitorParameter" | "nextTriggerTime" | "taskParameter" | "isEnabled">>> | Schema.decodeTo<Schema.Struct<{
        id: Schema.String;
    } & import("@gyomu/shared/entity").Optionalized<Pick<{
        readonly serviceId: Schema.String;
        readonly description: Schema.String;
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly monitorParameter: Schema.String;
        readonly nextTriggerTime: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        readonly taskParameter: Schema.NullOr<Schema.String>;
        readonly isEnabled: Schema.Boolean;
    }, "description" | "applicationId" | "taskInformationId" | "serviceId" | "monitorParameter" | "nextTriggerTime" | "taskParameter" | "isEnabled">>>, Schema.Struct<{
        id: Schema.toEncoded<Schema.String>;
        readonly description: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly applicationId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly taskInformationId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly serviceId: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly monitorParameter: Schema.toEncoded<Schema.optional<Schema.String>>;
        readonly nextTriggerTime: Schema.toEncoded<Schema.optional<Schema.decodeTo<Schema.String, Schema.Date, never, never>>>;
        readonly taskParameter: Schema.toEncoded<Schema.optional<Schema.NullOr<Schema.String>>>;
        readonly isEnabled: Schema.toEncoded<Schema.optional<Schema.Boolean>>;
    }>, never, never>;
    types: {
        _select: {
            readonly id: string;
            readonly description: string;
            readonly applicationId: string;
            readonly taskInformationId: string;
            readonly serviceId: string;
            readonly monitorParameter: string;
            readonly nextTriggerTime: string;
            readonly taskParameter: string | null;
            readonly isEnabled: boolean;
        } | {
            readonly id: string;
            readonly description: string;
            readonly applicationId: string;
            readonly taskInformationId: string;
            readonly serviceId: string;
            readonly monitorParameter: string;
            readonly nextTriggerTime: string;
            readonly taskParameter: string | null;
            readonly isEnabled: boolean;
        };
        _insert: import("@gyomu/shared/entity").Mutable<{
            readonly description: string;
            readonly applicationId: string;
            readonly taskInformationId: string;
            readonly serviceId: string;
            readonly monitorParameter: string;
            readonly nextTriggerTime: string;
            readonly taskParameter: string | null;
            readonly isEnabled: boolean;
        }>;
        _update: import("@gyomu/shared/entity").Mutable<{
            readonly id: string;
            readonly description?: string | undefined;
            readonly applicationId?: string | undefined;
            readonly taskInformationId?: string | undefined;
            readonly serviceId?: string | undefined;
            readonly monitorParameter?: string | undefined;
            readonly nextTriggerTime?: string | undefined;
            readonly taskParameter?: string | null | undefined;
            readonly isEnabled?: boolean | undefined;
        } | {
            readonly id: string;
            readonly description?: string | undefined;
            readonly applicationId?: string | undefined;
            readonly taskInformationId?: string | undefined;
            readonly serviceId?: string | undefined;
            readonly monitorParameter?: string | undefined;
            readonly nextTriggerTime?: string | undefined;
            readonly taskParameter?: string | null | undefined;
            readonly isEnabled?: boolean | undefined;
        }>;
    };
    updatefieldNames: string[];
    includeAuditFields: boolean;
    fields: {
        readonly serviceId: Schema.String;
        readonly description: Schema.String;
        readonly applicationId: Schema.String;
        readonly taskInformationId: Schema.String;
        readonly monitorParameter: Schema.String;
        readonly nextTriggerTime: Schema.decodeTo<Schema.String, Schema.Date, never, never>;
        readonly taskParameter: Schema.NullOr<Schema.String>;
        readonly isEnabled: Schema.Boolean;
    };
    tags: {
        entity: string;
        sensitiveFields?: readonly ("description" | "applicationId" | "taskInformationId" | "serviceId" | "monitorParameter" | "nextTriggerTime" | "taskParameter" | "isEnabled")[] | undefined;
    };
    ui: Partial<{
        readonly serviceId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly description?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly applicationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly taskInformationId?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly monitorParameter?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly nextTriggerTime?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly taskParameter?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
        readonly isEnabled?: import("@gyomu/shared/entity").UIAnnotationField | undefined;
    }> | undefined;
};
//# sourceMappingURL=gyomu.d.ts.map