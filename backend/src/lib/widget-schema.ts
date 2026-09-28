export interface ParamDef {
    name: string;
    type: "integer" | "string";
    label?: string;
}

export function assertValidParamsSchema(paramsSchema: unknown): ParamDef[] {
    if (!Array.isArray(paramsSchema) || paramsSchema.length === 0) {
        throw new Error("A widget type must expose at least one configuration parameter");
    }

    for (const param of paramsSchema) {
        if (typeof param !== "object" || param === null ||
            typeof (param as ParamDef).name !== "string" ||
            (param as ParamDef).name.length === 0 ||
            ((param as ParamDef).type !== "integer" && (param as ParamDef).type !== "string")
        ) {
            throw new Error(`Invalid param definition: ${JSON.stringify(param)}`);
        }
    }
    return paramsSchema as ParamDef[];
}

export function validateWidgetConfig( paramsSchema: ParamDef[], config: Record<string, unknown>): void {
    for (const param of paramsSchema) {
        const value = config[param.name];

        if (value === undefined || value === null) {
            throw new Error(`Missing required param "${param.name}"`);
        }
        if (param.type === "integer" && !Number.isInteger(value)) {
            throw new Error(`Param "${param.name}" must be an integer`);
        }
        if (param.type === "string" && typeof value !== "string") {
            throw new Error(`Param "${param.name}" must be a string`);
        }
    }
}
