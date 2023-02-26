"use strict"

class Lottery {
    constructor(id, tickets) {
        this.tickets = tickets;
        this.free = Array.from({length: tickets.length}, (v, k) => k);
        this.booked = [];

        this.id = id;
        this.storage = localStorage;
        this.loadFromStorage();
    }
    loadFromStorage() {
        const dataJSON = this.storage.getItem(this.id);
        if (dataJSON) {
            const data = JSON.parse(dataJSON);
            this.free = data.free;
            this.booked = data.booked;
        }
    }
    loadToStorage() {
        this.storage.setItem(this.id, JSON.stringify({
            free: this.free,
            booked: this.booked
        }));
    }
    select() {
        if (!this.free.length) {
            this.free = this.booked;
            this.booked = [];
        }
        const randomIndex = Math.trunc(Math.random() * this.free.length);
        this.booked.push(this.free[randomIndex]);
        this.free.splice(randomIndex, 1);
        this.loadToStorage();
        return this.tickets[this.booked[this.booked.length - 1]];
    }
    get counter() {
        return this.booked.length;
    }
    get size() {
        return this.tickets.length;
    }
    get lastDraw() {
        if (this.booked.length) {
            return this.tickets[this.booked[this.booked.length - 1]];
        }
        else {
            return null;
        }
    }
}