const bcrypt = require("bcryptjs");

// Temporary users
// Later these will come from the database
let staffUsers = [
    {
        id: 1,
        name: "Administrator",
        email: "derrick.mason@gouldings.education",
        password: bcrypt.hashSync("DistanceAdmin2026@Gouldings", 10),
        role: "Administrator"
    },
    {
        id: 2,
        name: "Claire",
        email: "claire@gouldings.education",
        password: bcrypt.hashSync("DistanceAdmin2026@Gouldings", 10),
        role: "Administrator"
    },

     {
        id: 3,
        name: "jOY banerjee",
        email: "Joy@gouldings.education",
        password: bcrypt.hashSync("DistanceAdmin2026@Gouldings", 10),
        role: "Team member"
    },

     {
        id: 4,
        name: "Prathistha",
        email: "Prathistha@gouldings.education",
        password: bcrypt.hashSync("DistanceAdmin2026@Gouldings", 10),
        role: " Team Member"
    },


   {
        id: 5,
        name: "DP",
        email: "DP@gouldings.education",
        password: bcrypt.hashSync("DistanceAdmin2026@Gouldings", 10),
        role: "Team Member"
    },


     {
        id: 6,
        name: "Arnab",
        email: "Arnab@gouldings.education",
        password: bcrypt.hashSync("DistanceAdmin2026@Gouldings", 10),
        role: "Team Member"
    },

     {
        id: 7,
        name: "Nidhi",
        email: "Nidhi@gouldings.education",
        password: bcrypt.hashSync("DistanceAdmin2026@Gouldings", 10),
        role: "Team Member"
    }







];

exports.login = async (req, res) => {

    const { email, password } = req.body;

    const user = staffUsers.find(
        u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    res.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });

};