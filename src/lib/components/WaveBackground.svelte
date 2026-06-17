<!-- Brave Search uses two positioned SVG backgrounds (waves-top + waves-bottom). -->
<div class="waves-top" aria-hidden="true"></div>
<div class="waves-bottom" aria-hidden="true"></div>

<style>
	.waves-top,
	.waves-bottom {
		position: absolute;
		width: 100%;
		background-repeat: no-repeat;
		background-size: 100% 100%;
		pointer-events: none;
		z-index: 0;
	}

	.waves-top {
		top: 0;
		height: 25%;
		background-image: url('/waves-bg-top.svg');
		background-position: left bottom;
	}

	.waves-bottom {
		bottom: 0;
		height: 30%;
		background-image: url('/waves-bg-bottom.svg');
		background-position: right bottom;
	}

	@media (max-width: 1300px) {
		.waves-top,
		.waves-bottom {
			background-size: 150% 100%;
		}
	}

	@media (max-width: 968px) {
		.waves-top,
		.waves-bottom {
			background-size: 200% 100%;
		}
	}

	:global([data-theme='light']) .waves-top,
	:global([data-theme='sand']) .waves-top,
	:global([data-theme='sakura']) .waves-top {
		background-image: url('/waves-bg-top-light.svg');
	}

	:global([data-theme='light']) .waves-bottom,
	:global([data-theme='sand']) .waves-bottom,
	:global([data-theme='sakura']) .waves-bottom {
		background-image: url('/waves-bg-bottom-light.svg');
	}
</style>
