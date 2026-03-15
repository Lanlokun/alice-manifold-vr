import json

# Load both files
with open('../data/alice_vr_final.json', 'r') as f:
    final_data = json.load(f)

with open('../data/alice_4subjects_vr.json', 'r') as f:
    subjects_data = json.load(f)

# Create a lookup for LLM coordinates by time (TR)
llm_coords = {
    item['tr']: {
        'xllm_vr': item['xllm_vr'],
        'yllm_vr': item['yllm_vr'],
        'zllm_vr': item['zllm_vr']
    } 
    for item in final_data
}

# Merge LLM coordinates into the 4 subjects file
for entry in subjects_data:
    t_idx = entry['time_index']
    if t_idx in llm_coords:
        entry.update(llm_coords[t_idx])

# Save the unified file
with open('alice_unified_4subjects.json', 'w') as f:
    json.dump(subjects_data, f, indent=2)

print("Merge complete: alice_unified_4subjects.json created.")