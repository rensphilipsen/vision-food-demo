<script lang="ts">
	let file: File | null = null;
	let preview: string | null = null;
	let items: { name: string; score: number }[] = [];
	let loading = false;

	async function pick(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		file = input.files?.[0] ?? null;
		items = [];

		if (preview) URL.revokeObjectURL(preview);
		preview = file ? URL.createObjectURL(file) : null;

		// Auto-analyze when image is selected
		if (file) {
			await analyze();
		}
	}

	async function analyze() {
		if (!file) return;
		loading = true;

		const fd = new FormData();
		fd.append('image', file);

		try {
			const res = await fetch('/api/labels', {
				method: 'POST',
				body: fd
			});

			const data = await res.json();
			items = data.items ?? [];
		} catch (err) {
			console.error('Analysis failed:', err);
			items = [];
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	<h1>Food Analyzer</h1>
	
	<label class="camera-button" for="file-input">
		📷 {loading ? 'Analyzing...' : 'Take Picture'}
	</label>
	<input 
		id="file-input"
		type="file" 
		accept="image/*" 
		capture="environment" 
		on:change={pick}
	/>

	{#if preview}
		<div class="preview-container">
			<img src={preview} alt="food preview" />
		</div>
	{/if}

	{#if items.length > 0}
		<div class="results">
			<h2>Detected Foods</h2>
			<ul>
				{#each items as i (i.name)}
					<li class="result-item">
						<span class="name">{i.name}</span>
						<span class="score">{(i.score * 100).toFixed(0)}%</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if loading}
		<div class="loading">Analyzing your food...</div>
	{/if}
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.container {
		width: 100%;
		max-width: 500px;
		padding: 20px;
		background: white;
		border-radius: 20px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	}

	h1 {
		text-align: center;
		color: #333;
		margin: 0 0 30px 0;
		font-size: 28px;
	}

	h2 {
		color: #555;
		font-size: 18px;
		margin: 20px 0 15px 0;
	}

	input[type='file'] {
		display: none;
	}

	.camera-button {
		display: block;
		width: 100%;
		padding: 16px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		text-align: center;
		transition: transform 0.2s, box-shadow 0.2s;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
	}

	.camera-button:active {
		transform: scale(0.98);
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
	}

	.preview-container {
		margin: 20px 0;
		display: flex;
		justify-content: center;
	}

	.preview-container img {
		max-width: 100%;
		max-height: 400px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.results {
		margin-top: 20px;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.result-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px;
		background: #f5f5f5;
		border-radius: 8px;
		margin-bottom: 10px;
		transition: background 0.2s;
	}

	.result-item:active {
		background: #e8e8e8;
	}

	.name {
		font-weight: 500;
		color: #333;
	}

	.score {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 14px;
		font-weight: 600;
	}

	.loading {
		text-align: center;
		padding: 20px;
		color: #667eea;
		font-weight: 600;
	}

	@media (max-width: 480px) {
		.container {
			border-radius: 12px;
			padding: 16px;
		}

		h1 {
			font-size: 24px;
			margin-bottom: 20px;
		}

		.camera-button {
			padding: 14px;
			font-size: 15px;
		}

		.preview-container img {
			max-height: 300px;
		}
	}
</style>
