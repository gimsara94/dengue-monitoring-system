UPDATE hospitals
SET name = COALESCE(:name, name),
    address = COALESCE(:address, address),
    telephone = COALESCE(:telephone, telephone),
    email = COALESCE(:email, email)
WHERE id = :id
RETURNING id, name, address, telephone, email;
