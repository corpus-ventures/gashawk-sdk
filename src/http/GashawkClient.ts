import {
    LoginPayload,
    SubmitableTransaction,
    TransactionWithFee,
    UserSettings,
    USER_SETTINGS_DEFAULT,
} from "gashawk-common";
import axios, { Axios } from "axios";
import { GASHAWK_BACKEND_URL } from "../constants";

export class GashawkClient {
    private TRANSACTION_PATH = "/tx";
    private SUBMIT_PATH = "/tx/submit";
    private SETTINGS_PATH = "/user/settings";

    private token: string;
    protected client: Axios;

    constructor(token: string) {
        this.client = axios.create({
            baseURL: GASHAWK_BACKEND_URL,
        });
        this.token = token;
    }

    private getAuth() {
        return {
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        };
    }
    public async getTransactions(): Promise<TransactionWithFee[] | null> {
        const url = `${this.TRANSACTION_PATH}/txList`;
        try {
            const { data } = await this.client.get(url, this.getAuth());
            return data as TransactionWithFee[];
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async getTransaction(
        id: string
    ): Promise<TransactionWithFee | null> {
        const url = `${this.TRANSACTION_PATH}/byId`;
        try {
            const { data } = await this.client.get(url, {
                params: { id },
                ...this.getAuth(),
            });
            return data as TransactionWithFee;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    public async submitTransaction(
        submitableTransactions: SubmitableTransaction[]
    ): Promise<boolean> {
        const url = this.SUBMIT_PATH;
        try {
            const { data, status } = await this.client.post(
                url,
                submitableTransactions,
                this.getAuth()
            );

            const [{ hasError, value }] = data;
            if (hasError) {
                throw Error(value);
            }
            return true;
        } catch (err) {
            console.error(err);
            throw new Error("cannot submit transaction to gashawk");
        }
    }

    public async getUsersTransactionCount(
        user: string
    ): Promise<number | null> {
        try {
            const url = `/user/transactionCount`;
            const { status, data } = await this.client.get(url, {
                params: { user },
                ...this.getAuth(),
            });
            if (status !== 200) {
                throw new Error("Cant get users transaction count");
            }

            return data.transactionCount as number;
        } catch (e) {
            console.error(e);
            throw new Error("Cant get users transaction count");
        }
    }

    public async getUserSettings(user: string): Promise<UserSettings> {
        const url = `${this.SETTINGS_PATH}`;
        try {
            const { data } = await this.client.get(url, {
                params: { user },
                ...this.getAuth(),
            });
            return data;
        } catch (err) {
            console.log(err);
            return USER_SETTINGS_DEFAULT;
        }
    }
}
