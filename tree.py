import os

def generate_tree(start_path='.', output_file='directory_structure.txt'):
    with open(output_file, 'w', encoding='utf-8') as f:
        for root, dirs, files in os.walk(start_path):
            level = root.replace(start_path, '').count(os.sep)
            indent = '│   ' * level + '├── '
            f.write(f"{indent}{os.path.basename(root)}/\n")
            subindent = '│   ' * (level + 1) + '├── '
            for file in files:
                f.write(f"{subindent}{file}\n")
    print(f"✅ Directory structure saved to {output_file}")

# Run the function in current directory
generate_tree('.', 'tree_output.txt')
