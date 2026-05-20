import {Modules} from "@strapi/strapi";

export type Context = Modules.Documents.Middleware.Context;
export type Next = () => ReturnType<Modules.Documents.ServiceInstance[keyof Modules.Documents.ServiceInstance]>;

export type UID = Context["uid"];
