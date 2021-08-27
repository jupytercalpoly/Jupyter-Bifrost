#!/usr/bin/env python

"""The setup script."""

from setuptools import setup, find_packages

with open('README.rst') as readme_file:
    readme = readme_file.read()

with open('HISTORY.rst') as history_file:
    history = history_file.read()

requirements = [ ]

test_requirements = [ ]

setup(
    author="Jay Ahn",
    author_email='aju960219@gmail.com',
    python_requires='>=3.6',
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Natural Language :: English',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
    ],
    description="Bifrost Tracing traces codes used in a notebook",
    entry_points={
        'console_scripts': [
            'bifrost_tracing=bifrost_tracing.cli:main',
        ],
    },
    install_requires=requirements,
    license="BSD license",
    long_description=readme + '\n\n' + history,
    include_package_data=True,
    keywords='bifrost_tracing',
    name='bifrost_tracing',
    packages=find_packages(include=['bifrost_tracing', 'bifrost_tracing.*']),
    test_suite='tests',
    tests_require=test_requirements,
    url='https://github.com/jaahn96/bifrost_tracing',
    version='0.1.0',
    zip_safe=False,
)
