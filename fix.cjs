const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Remove useAuth hook entirely
    if (content.match(/useAuth()/)) {
        content = content.replace(/.*useAuth.*[\r\n]+/g, '');
        changed = true;
    }

    // Replace old handleActionClick
    const oldFunc = `const handleActionClick = (action: () => void) => {
        if (!user) {
            openAuthModal();
        } else {
            action();
        }
    };`;
    
    const oldFunc2 = `    const handleActionClick = (action: () => void) => {
        if (!user) {
            openAuthModal();
        } else {
            action();
        }
    };`;

    const newFunc = `    const handleActionClick = (action: () => void) => {
        action();
    };`;

    if (content.includes(oldFunc)) {
        content = content.replace(oldFunc, newFunc);
        changed = true;
    }
    if (content.includes(oldFunc2)) {
        content = content.replace(oldFunc2, newFunc);
        changed = true;
    }
    
    // Also remove AuthModal imports if present
    if (content.includes("AuthModal")) {
        content = content.replace(/.*AuthModal.*[\r\n]+/g, '');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
