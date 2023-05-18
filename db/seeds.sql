INSERT INTO department(department_name)
VALUES("engineering"),("finance"),("legal"),("sales");

INSERT INTO role(title, salary, department_id)
VALUES("Sales Lead", 100000, 1), ("Salesperson", 80000, 2), ("Lead Engineer", 150000, 3), ("Software Engineer", 120000, 4), ("Account Manager", 160000, 5), ("Accountant", 125000, 6), ("Legal Team Lead", 250000, 7), ("Lawyer", 190000, 8);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ("Cameron", "Szabo", 1, 2), ("Clifford","Daugette", 2, NULL), ("Ryan","Paparo", 3, 4), ("Daysha","Wyrick", 4, NULL), ("Dafine","Barquera", 5, 6), ("Diego","Castano", 6, NULL), ("Kevin","Cruz", 7, 8), ("Kyle","Peggs", 8, NULL);