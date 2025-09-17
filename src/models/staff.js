
class Staff {
  constructor(staff_id, first_name, last_name, address_id, email, store_id, active, username) {
    this.staff_id = staff_id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.address_id = address_id;
    this.email = email;
    this.store_id = store_id;
    this.active = active;
    this.username = username;
  }
}

module.exports = Staff;