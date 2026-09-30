INSERT INTO hospitals (name, address, telephone, email)
VALUES (:name, :address, :telephone, :email)
RETURNING id, name, address, telephone, email;
